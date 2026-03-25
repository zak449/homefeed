import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/* ── Rate limiter: 5 req/min per IP ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

/* ── Simple in-memory cache keyed by listingId ── */
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { listingId, address, city, state, sqft, bedrooms, bathrooms, propertyType, price } = body;

    if (!address || !city) {
      return NextResponse.json({ error: "address and city required" }, { status: 400 });
    }

    // Check cache (1 hour TTL)
    const cacheKey = listingId || `${address}-${city}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const anthropic = new Anthropic();

    const prompt = `You are a real estate renovation cost estimator. Given this property, provide remodel cost estimates specific to the LOCAL MARKET (${city}, ${state || "US"}).

Property Details:
- Address: ${address}, ${city}${state ? ", " + state : ""}
- Square footage: ${sqft || "Unknown"}
- Bedrooms: ${bedrooms || "Unknown"}
- Bathrooms: ${bathrooms || "Unknown"}
- Property type: ${propertyType || "Unknown"}
- Current price: $${price ? price.toLocaleString() : "Unknown"}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "estimates": [
    {
      "label": "Kitchen Remodel",
      "emoji": "🍳",
      "low": 15000,
      "high": 45000,
      "note": "Brief note about scope"
    }
  ],
  "afterRenoValueLow": 1150000,
  "afterRenoValueHigh": 1350000,
  "marketNote": "One sentence about the local renovation market"
}

Include these 8 categories: Kitchen Remodel, Bathroom Remodel (all bathrooms), Full Interior Paint, New Flooring, Roof Replacement, Landscaping, ADU/Guest House, Full Gut Renovation.

Use realistic ${city} market rates. Factor in local labor costs, material availability, and permit requirements. The low estimate is for a mid-range update; the high estimate is for a premium renovation.

After-reno values should be realistic appreciation based on the current price and typical ROI for renovations in ${city}.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    const result = {
      estimates: parsed.estimates || [],
      afterRenoValueLow: parsed.afterRenoValueLow || 0,
      afterRenoValueHigh: parsed.afterRenoValueHigh || 0,
      marketNote: parsed.marketNote || "",
      source: "ai",
    };

    // Cache for 1 hour
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + 3600_000 });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Remodel Estimates] Error:", error);

    // Return fallback static estimates on error
    const body = await req.json().catch(() => ({}));
    const sqft = body.sqft || 1500;
    const baths = body.bathrooms || 2;
    const price = body.price || 500000;

    return NextResponse.json({
      estimates: [
        { label: "Kitchen Remodel", emoji: "🍳", low: Math.round(sqft * 5), high: Math.round(sqft * 15), note: `Based on ${sqft} sqft` },
        { label: "Bathroom Remodel", emoji: "🚿", low: 8000 * baths, high: 25000 * baths, note: `${baths} bathroom(s)` },
        { label: "Full Interior Paint", emoji: "🎨", low: Math.round(sqft * 2), high: Math.round(sqft * 5), note: `${sqft} sqft interior` },
        { label: "New Flooring", emoji: "🪵", low: Math.round(sqft * 3), high: Math.round(sqft * 12), note: "Hardwood/LVP throughout" },
        { label: "Roof Replacement", emoji: "🏠", low: 8000, high: 25000, note: "Depends on material" },
        { label: "Landscaping", emoji: "🌿", low: 5000, high: 30000, note: "Front + backyard" },
        { label: "ADU / Guest House", emoji: "🏡", low: 80000, high: 250000, note: "400-800 sqft detached" },
        { label: "Full Gut Renovation", emoji: "🔨", low: Math.round(sqft * 75), high: Math.round(sqft * 200), note: "Complete interior rebuild" },
      ],
      afterRenoValueLow: Math.round(price * 1.15),
      afterRenoValueHigh: Math.round(price * 1.35),
      marketNote: "Estimates based on national averages. Local rates may vary.",
      source: "fallback",
    });
  }
}
