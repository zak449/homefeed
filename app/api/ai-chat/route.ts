import { NextRequest, NextResponse } from "next/server";

/* ── Simple in-memory rate limiter: 10 requests/min per IP ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  if (entry.count > 10) return true;
  return false;
}

// Periodically clean up stale entries (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

const SYSTEM_PROMPT_DEFAULT = `You are Gwaky AI — brutally honest, no real estate jargon, no agent-speak. You tell users what the data and community actually says about a property. You're funny but accurate. Never recommend buying or not buying — give the community signal and let them decide. Keep responses under 150 words.`;

const SYSTEM_PROMPT_RENOVATION = `You are Gwaky AI — a renovation expert. Given this property's details, suggest specific renovation ideas with realistic cost ranges and estimated value added. Be direct and practical. Format costs like $5K-15K.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, listingId, context, mode } = body as {
      message: string;
      listingId: string;
      context: {
        address: string;
        city: string;
        price: number;
        sqft: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        propertyType: string;
        topTakes: string[];
      };
      mode?: "default" | "renovation";
    };

    const systemPrompt = mode === "renovation" ? SYSTEM_PROMPT_RENOVATION : SYSTEM_PROMPT_DEFAULT;

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

    // ── Mock response when no API key ──
    if (!apiKey) {
      return NextResponse.json({
        response:
          "Gwaky AI is coming soon! We're training our AI on real community data so it can give you the most honest, no-BS property insights. Stay tuned.",
        model: "gwaky-ai-mock",
      });
    }

    // ── Build user message with context ──
    const contextBlock = [
      `Property: ${context.address}, ${context.city}`,
      `Price: $${context.price.toLocaleString()}`,
      context.sqft ? `Size: ${context.sqft.toLocaleString()} sqft` : null,
      context.bedrooms != null ? `Bedrooms: ${context.bedrooms}` : null,
      context.bathrooms != null ? `Bathrooms: ${context.bathrooms}` : null,
      `Type: ${context.propertyType}`,
      context.topTakes.length > 0
        ? `Community takes: ${context.topTakes.join("; ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const userMessage = `Here's the listing info:\n${contextBlock}\n\nUser question: ${message}`;

    // ── Call Anthropic API ──
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai-chat] Anthropic API error:", res.status, errText);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const aiText =
      data.content?.[0]?.text ?? "Gwaky couldn't come up with anything. Try again!";

    return NextResponse.json({
      response: aiText,
      model: "gwaky-ai",
    });
  } catch (err) {
    console.error("[ai-chat] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
