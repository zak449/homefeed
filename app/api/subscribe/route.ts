import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addSubscriber, trackKlaviyoEvent } from "@/lib/klaviyo";

// ── Validation ─────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

const VALID_SOURCES = ["hero", "inline", "footer", "sticky", "api"] as const;

// ── POST /api/subscribe ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, source } = body as {
      email?: string;
      phone?: string;
      source?: string;
    };

    // Validate email
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Validate phone (optional)
    if (phone && !PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 }
      );
    }

    // Normalize
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedSource = VALID_SOURCES.includes(source as typeof VALID_SOURCES[number])
      ? source
      : "api";

    // Upsert into local database
    const subscriber = await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        ...(phone ? { phone } : {}),
        ...(normalizedSource ? { source: normalizedSource } : {}),
        ...(phone ? { smsEnabled: true } : {}),
      },
      create: {
        email: normalizedEmail,
        phone: phone ?? null,
        source: normalizedSource ?? "api",
        smsEnabled: Boolean(phone),
      },
    });

    // Sync to Klaviyo (non-blocking — we don't await in the response path
    // but we do want errors logged, so we catch inside)
    addSubscriber(normalizedEmail, phone ?? undefined, {
      source: normalizedSource,
    }).catch((err) =>
      console.error("[subscribe] Klaviyo sync failed:", err)
    );

    // Track "Signed Up" event in Klaviyo
    trackKlaviyoEvent(normalizedEmail, "Signed Up", {
      source: normalizedSource,
    }).catch((err) =>
      console.error("[subscribe] Klaviyo event tracking failed:", err)
    );

    return NextResponse.json({
      success: true,
      id: subscriber.id,
    });
  } catch (err) {
    console.error("[subscribe] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
