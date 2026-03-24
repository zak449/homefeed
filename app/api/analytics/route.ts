import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

/**
 * POST /api/analytics
 * Track user events and build profiles.
 *
 * Body: {
 *   anonId: string,
 *   type: "page_view" | "search" | "listing_view" | "comment" | "reaction",
 *   data?: object,
 *   latitude?: number,
 *   longitude?: number,
 * }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 60 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.anonId || !body?.type) {
    return NextResponse.json({ error: "anonId and type required" }, { status: 400 });
  }

  const { anonId, type, data, latitude, longitude } = body;

  // Validate event type
  const validTypes = ["page_view", "search", "listing_view", "comment", "reaction"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  try {
    // Find or reference user profile
    const user = await prisma.userProfile.findUnique({
      where: { anonId },
      select: { id: true },
    });

    // Create the event
    await prisma.analyticsEvent.create({
      data: {
        anonId,
        userId: user?.id ?? null,
        type,
        data: data ?? undefined,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    // Update user's lastSeenAt
    if (user) {
      await prisma.userProfile.update({
        where: { anonId },
        data: { lastSeenAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Analytics] Error:", e);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
