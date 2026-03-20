import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── GET /api/subscribe/preferences?email=... ───────────────

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email query parameter is required." },
      { status: 400 }
    );
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { email },
    select: {
      listingAlerts: true,
      hotTakesDigest: true,
      commentReplies: true,
      smsEnabled: true,
    },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: "No subscription found for this email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    listing_alerts: subscriber.listingAlerts,
    hot_takes_digest: subscriber.hotTakesDigest,
    comment_replies: subscriber.commentReplies,
    sms_enabled: subscriber.smsEnabled,
  });
}

// ── PUT /api/subscribe/preferences ─────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, listing_alerts, hot_takes_digest, comment_replies, sms_enabled } =
      body as {
        email?: string;
        listing_alerts?: boolean;
        hot_takes_digest?: boolean;
        comment_replies?: boolean;
        sms_enabled?: boolean;
      };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check subscriber exists
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No subscription found for this email." },
        { status: 404 }
      );
    }

    // Build update payload — only include fields that were explicitly provided
    const update: Record<string, boolean> = {};
    if (typeof listing_alerts === "boolean") update.listingAlerts = listing_alerts;
    if (typeof hot_takes_digest === "boolean") update.hotTakesDigest = hot_takes_digest;
    if (typeof comment_replies === "boolean") update.commentReplies = comment_replies;
    if (typeof sms_enabled === "boolean") update.smsEnabled = sms_enabled;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No preference fields provided to update." },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.update({
      where: { email: normalizedEmail },
      data: update,
      select: {
        listingAlerts: true,
        hotTakesDigest: true,
        commentReplies: true,
        smsEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      listing_alerts: subscriber.listingAlerts,
      hot_takes_digest: subscriber.hotTakesDigest,
      comment_replies: subscriber.commentReplies,
      sms_enabled: subscriber.smsEnabled,
    });
  } catch (err) {
    console.error("[preferences] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
