import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/* ── Rate limiter: 10 req/min per IP ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

// Cleanup stale entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

const SYSTEM_PROMPT = `You are Gwaky AI — brutally honest, no real estate jargon, no agent-speak. You tell users what the data and community actually says about a property. You're funny but accurate. Never recommend buying or not buying — give the community signal and let them decide. Keep responses under 150 words.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, listingId, context } = body as {
      message: string;
      listingId: string;
      context?: {
        address: string;
        city: string;
        price: number;
        sqft: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        propertyType: string;
        topTakes?: string[];
      };
    };

    if (!message || !listingId) {
      return NextResponse.json(
        { error: "Missing message or listingId" },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Mock response when no API key
    if (!apiKey) {
      return NextResponse.json({
        response:
          "Gwaky AI is coming soon! We're training our AI on real community data so it can give you the most honest, no-BS property insights. Stay tuned.",
        model: "gwaky-ai-mock",
      });
    }

    // Build user message with context
    const contextLines: string[] = [];
    if (context) {
      contextLines.push(`Property: ${context.address}, ${context.city}`);
      contextLines.push(`Price: $${context.price.toLocaleString()}`);
      if (context.sqft) contextLines.push(`Size: ${context.sqft.toLocaleString()} sqft`);
      if (context.bedrooms != null) contextLines.push(`Bedrooms: ${context.bedrooms}`);
      if (context.bathrooms != null) contextLines.push(`Bathrooms: ${context.bathrooms}`);
      contextLines.push(`Type: ${context.propertyType}`);
      if (context.topTakes && context.topTakes.length > 0) {
        contextLines.push(`Community takes: ${context.topTakes.join("; ")}`);
      }
    }

    const userMessage = contextLines.length > 0
      ? `Here's the listing info:\n${contextLines.join("\n")}\n\nUser question: ${message}`
      : message;

    // Call Anthropic SDK
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const aiText =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "Gwaky couldn't come up with anything. Try again!";

    return NextResponse.json({
      response: aiText,
      model: "gwaky-ai",
    });
  } catch (err) {
    console.error("[gwaky-ai] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
