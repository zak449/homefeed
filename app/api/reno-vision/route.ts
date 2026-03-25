import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import { verifyTurnstile } from "@/lib/verify-turnstile";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const VALID_RENO_TYPES = ["kitchen", "exterior", "master-bath", "landscaping", "adu", "full-gut"] as const;
const VALID_STYLES = ["modern", "mediterranean", "coastal", "mid-century", "farmhouse"] as const;

type RenoType = (typeof VALID_RENO_TYPES)[number];

const COST_TABLE: Record<RenoType, [number, number]> = {
  kitchen: [85_000, 180_000],
  exterior: [45_000, 120_000],
  "master-bath": [40_000, 95_000],
  landscaping: [25_000, 75_000],
  adu: [150_000, 350_000],
  "full-gut": [400_000, 900_000],
};

const RENO_LABELS: Record<RenoType, string> = {
  kitchen: "Kitchen",
  exterior: "Exterior",
  "master-bath": "Master Bath",
  landscaping: "Landscaping",
  adu: "ADU",
  "full-gut": "Full Gut",
};

export async function POST(request: NextRequest) {
  try {
    // VERY strict rate limit: 2 requests per 5 minutes per IP
    const ip = getClientIp(request);
    const { success: rateLimitOk } = rateLimit(ip, {
      interval: 300_000,
      maxRequests: 2,
    });
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can generate 2 visions per 5 minutes. Please wait." },
        { status: 429 }
      );
    }

    // Additional daily limit: 10 per day per IP
    const { success: dailyOk } = rateLimit(`daily:${ip}`, {
      interval: 86_400_000,
      maxRequests: 10,
    });
    if (!dailyOk) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      listingId,
      renovationType,
      style,
      listingAddress,
      listingPhoto,
      listingPrice,
      turnstileToken,
    } = body;

    // Validate Turnstile token if configured
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Bot verification required." },
          { status: 403 }
        );
      }
      const turnstileValid = await verifyTurnstile(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "Bot verification failed. Please refresh and try again." },
          { status: 403 }
        );
      }
    }

    // Validate renovationType
    if (!renovationType || !VALID_RENO_TYPES.includes(renovationType)) {
      return NextResponse.json(
        { error: `Invalid renovationType. Must be one of: ${VALID_RENO_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate style
    if (!style || !VALID_STYLES.includes(style)) {
      return NextResponse.json(
        { error: `Invalid style. Must be one of: ${VALID_STYLES.join(", ")}` },
        { status: 400 }
      );
    }

    const renoType = renovationType as RenoType;
    const [baseLow, baseHigh] = COST_TABLE[renoType];

    // Apply cost multiplier for luxury properties (>$2M)
    const priceNum = typeof listingPrice === "string"
      ? parseInt(listingPrice.replace(/[^0-9]/g, ""), 10)
      : (listingPrice ?? 0);
    const multiplier = priceNum > 2_000_000 ? 1.4 : 1.0;
    const estimateLow = Math.round(baseLow * multiplier);
    const estimateHigh = Math.round(baseHigh * multiplier);

    // If no OpenAI key, return mock response
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        imageUrl: null,
        estimateLow,
        estimateHigh,
        materials: [
          { item: "Premium Countertops", brand: "Caesarstone", priceRange: "$3,000 - $8,000" },
          { item: "Custom Cabinetry", brand: "Kraftmaid", priceRange: "$8,000 - $20,000" },
          { item: "Hardwood Flooring", brand: "Shaw", priceRange: "$4,000 - $10,000" },
          { item: "Lighting Fixtures", brand: "Restoration Hardware", priceRange: "$1,500 - $5,000" },
          { item: "Appliance Package", brand: "Thermador", priceRange: "$6,000 - $15,000" },
        ],
        renovationType: renoType,
        style,
        isMock: true,
      });
    }

    const renoLabel = RENO_LABELS[renoType];
    const styleLabel = style.charAt(0).toUpperCase() + style.slice(1);

    // Generate image with DALL-E 3
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let imageUrl: string | null = null;

    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional architectural rendering of a ${styleLabel} style ${renoLabel} renovation for a residential property. Photorealistic, interior design magazine quality, well-lit, showing finished materials and furnishings. No text or watermarks.`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });
      imageUrl = imageResponse.data?.[0]?.url ?? null;
    } catch (imgErr) {
      console.error("[reno-vision] DALL-E error:", imgErr);
      // Continue without image
    }

    // Generate materials list with Anthropic
    let materials: { item: string; brand: string; priceRange: string }[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const materialsResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `You are a renovation cost estimator. For a ${styleLabel} style ${renoLabel} renovation${listingAddress ? ` at ${listingAddress}` : ""}, provide a JSON array of 5-7 key materials/items needed. Each item should have real brand names and realistic price ranges. Format: [{"item": "name", "brand": "BrandName", "priceRange": "$X,XXX - $X,XXX"}]. Only respond with the JSON array, no other text.`,
            },
          ],
        });

        const textBlock = materialsResponse.content.find(
          (b) => b.type === "text"
        );
        if (textBlock && textBlock.type === "text") {
          const parsed = JSON.parse(textBlock.text);
          if (Array.isArray(parsed)) {
            materials = parsed;
          }
        }
      } catch (matErr) {
        console.error("[reno-vision] Materials generation error:", matErr);
        // Fallback materials
        materials = [
          { item: "Premium Materials Package", brand: "Various", priceRange: `$${Math.round(estimateLow * 0.4).toLocaleString()} - $${Math.round(estimateHigh * 0.4).toLocaleString()}` },
          { item: "Labor & Installation", brand: "Licensed Contractor", priceRange: `$${Math.round(estimateLow * 0.35).toLocaleString()} - $${Math.round(estimateHigh * 0.35).toLocaleString()}` },
          { item: "Permits & Design", brand: "Local", priceRange: `$${Math.round(estimateLow * 0.1).toLocaleString()} - $${Math.round(estimateHigh * 0.1).toLocaleString()}` },
        ];
      }
    }

    return NextResponse.json({
      imageUrl,
      estimateLow,
      estimateHigh,
      materials,
      renovationType: renoType,
      style,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[reno-vision] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
