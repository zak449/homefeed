import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addSubscriber, trackKlaviyoEvent } from "@/lib/klaviyo";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import { verifyTurnstile } from "@/lib/verify-turnstile";

// ── Validation ─────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

const VALID_SOURCES = ["hero", "inline", "footer", "sticky", "api"] as const;

// ── POST /api/subscribe ────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 5 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, phone, source, turnstileToken } = body as {
      email?: string;
      phone?: string;
      source?: string;
      turnstileToken?: string;
    };

    // Turnstile verification (skipped if TURNSTILE_SECRET_KEY is not set)
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Verification required" },
          { status: 400 }
        );
      }
      const valid = await verifyTurnstile(turnstileToken);
      if (!valid) {
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 403 }
        );
      }
    }

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
