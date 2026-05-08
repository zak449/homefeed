"use server";

/**
 * Server actions for onboarding & consent.
 *
 * Separated from /app routes so any UI layer (wizard, Tier 2 modal,
 * profile-edit form) can call into the same source of truth.
 *
 * Each action:
 *   1. Validates with zod (defense in depth — client may bypass)
 *   2. Authenticates via Auth.js session (auth task owns `auth()`)
 *   3. Mutates the User row in a transaction with consent logging
 *
 * IMPORTANT: This file imports `auth` from "@/lib/auth", which is
 * provided by the auth/comments/notifications task. If their export
 * shape differs (e.g. they use `getServerSession`), update the import
 * here only — no other file depends on the auth shape.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  tier1Schema,
  tier2Schema,
  type Tier1Input,
  type Tier2Input,
} from "@/lib/onboarding/validation";
import { recordConsent, recordConsents } from "@/lib/consent/recordConsent";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login?from=/onboarding");
  return id;
}

async function getRequestMeta() {
  const h = await headers();
  return {
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent") ?? null,
  };
}

// --------------------------------------------------------------------
// Tier 1: complete the signup wizard
// --------------------------------------------------------------------
export async function submitOnboarding(
  raw: Tier1Input
): Promise<ActionResult<{ redirectTo: string }>> {
  const userId = await requireUserId();
  const parsed = tier1Schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  const meta = await getRequestMeta();

  // Username uniqueness — DB has @unique but checking here gives a
  // clean field error instead of a P2002 in the catch block.
  const taken = await prisma.user.findFirst({
    where: { username: data.username, NOT: { id: userId } },
    select: { id: true },
  });
  if (taken) {
    return {
      ok: false,
      error: "Username already in use.",
      fieldErrors: { username: "That username is already in use. Try another." },
    };
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        // The auth task's User model uses `name` as the display name.
        // We map our `displayName` form input to `name` here so we don't
        // need a duplicate column.
        name: data.displayName,
        username: data.username,
        role: data.role,
        markets: data.markets,
        neighborhoods: data.neighborhoods,
        marketingConsent: data.marketingConsent,
        marketingConsentAt: data.marketingConsent ? now : null,
        personalizationConsent: data.personalizationConsent,
        personalizationConsentAt: now,
        tosAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        dataProcessingConsentedAt: now,
        onboardingCompletedAt: now,
      },
    });
    await recordConsents(
      tx as unknown as typeof prisma,
      { userId, context: "signup_wizard", ...meta },
      [
        { type: "TOS", value: true },
        { type: "PRIVACY_POLICY", value: true },
        { type: "DATA_PROCESSING", value: true },
        { type: "MARKETING", value: data.marketingConsent },
        { type: "PERSONALIZATION", value: data.personalizationConsent },
      ]
    );
  });

  revalidatePath("/");
  revalidatePath("/profile/edit");
  return { ok: true, data: { redirectTo: "/?welcome=1" } };
}

// --------------------------------------------------------------------
// Tier 2: progressive disclosure (one-question-at-a-time modal)
// --------------------------------------------------------------------
export async function saveTier2Field(
  raw: Partial<Tier2Input>
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = tier2Schema.partial().safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });
  revalidatePath("/profile/edit");
  return { ok: true };
}

// --------------------------------------------------------------------
// Per-field privacy toggle (used in /profile/edit)
// --------------------------------------------------------------------
type PrivacyField =
  | "showRolePublicly"
  | "showMarketsPublicly"
  | "showWatchlistPublicly";

export async function setFieldPrivacy(
  field: PrivacyField,
  isPublic: boolean
): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { [field]: isPublic },
  });
  revalidatePath("/profile/edit");
  return { ok: true };
}

// --------------------------------------------------------------------
// Consent toggle (used by /profile/edit Privacy & Data section)
// --------------------------------------------------------------------
export async function toggleConsent(
  type: "MARKETING" | "PERSONALIZATION" | "PUSH",
  value: boolean
): Promise<ActionResult> {
  const userId = await requireUserId();
  const meta = await getRequestMeta();
  const now = new Date();

  const dataPatch: Record<string, unknown> = {};
  if (type === "MARKETING") {
    dataPatch.marketingConsent = value;
    dataPatch.marketingConsentAt = value ? now : null;
  } else if (type === "PERSONALIZATION") {
    dataPatch.personalizationConsent = value;
    dataPatch.personalizationConsentAt = value ? now : null;
  } else if (type === "PUSH") {
    dataPatch.pushConsent = value;
    dataPatch.pushConsentAt = value ? now : null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: dataPatch });
    await recordConsent(tx as unknown as typeof prisma, {
      userId,
      type,
      value,
      context: "profile_edit",
      ...meta,
    });
  });
  revalidatePath("/profile/edit");
  return { ok: true };
}

// --------------------------------------------------------------------
// GDPR / CCPA: export and delete
// --------------------------------------------------------------------
export async function requestDataExport(): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const req = await prisma.dataExportRequest.create({
    data: { userId },
    select: { id: true },
  });
  // Worker job (out of scope here) picks up PENDING requests, packages
  // a JSON archive, and emails the download link. See worker README.
  return { ok: true, data: { id: req.id } };
}

export async function requestAccountDeletion(
  reason?: string
): Promise<ActionResult<{ scheduledFor: string }>> {
  const userId = await requireUserId();
  const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.accountDeletionRequest.upsert({
    where: { userId },
    create: { userId, scheduledFor, reason },
    update: { scheduledFor, reason, cancelledAt: null },
  });
  return { ok: true, data: { scheduledFor: scheduledFor.toISOString() } };
}

export async function cancelAccountDeletion(): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.accountDeletionRequest.update({
    where: { userId },
    data: { cancelledAt: new Date() },
  });
  return { ok: true };
}
