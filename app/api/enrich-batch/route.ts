import { NextRequest, NextResponse } from "next/server";
import { enrichBatch } from "@/lib/enrich-batch";

/**
 * POST /api/enrich-batch
 * Body: { listingIds: string[] }
 *
 * Enriches up to 5 listings with full photos + description from the detail API.
 * Rate-limited to prevent API abuse.
 */

// Simple in-memory rate limit: max 1 batch per 10 seconds per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 10_000;

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const lastCall = rateLimitMap.get(ip) ?? 0;
  const now = Date.now();

  if (now - lastCall < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Rate limited. Try again shortly." },
      { status: 429 }
    );
  }
  rateLimitMap.set(ip, now);

  // Clean old entries periodically
  if (rateLimitMap.size > 1000) {
    const cutoff = now - RATE_LIMIT_MS * 2;
    for (const [key, time] of rateLimitMap) {
      if (time < cutoff) rateLimitMap.delete(key);
    }
  }

  try {
    const body = await req.json().catch(() => null);
    const listingIds: string[] = body?.listingIds;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: "listingIds array required" },
        { status: 400 }
      );
    }

    // Cap at 5
    const ids = listingIds.slice(0, 5);
    const successCount = await enrichBatch(ids);

    return NextResponse.json({ success: true, enriched: successCount, total: ids.length });
  } catch (e) {
    console.error("[EnrichBatch API] Error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
