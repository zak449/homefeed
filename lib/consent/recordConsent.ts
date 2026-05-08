/**
 * Centralized consent-logging helper. Every feature that toggles a
 * consent flag (signup wizard, /profile/edit, Tier 2 modal, push
 * permission prompt) calls this so the audit trail is consistent.
 *
 * IP addresses are hashed at write time — we keep a fingerprint for
 * audit defensibility without storing raw PII. The hashing key lives
 * in CONSENT_IP_HASH_SECRET (env), not in code.
 */
import { createHash } from "node:crypto";
import type { PrismaClient, ConsentType } from "@prisma/client";

export type RecordConsentArgs = {
  userId: string;
  type: ConsentType;
  value: boolean;
  context: "signup_wizard" | "profile_edit" | "tier2_modal" | "push_prompt" | "api";
  ipAddress?: string | null;
  userAgent?: string | null;
};

function hashIp(ip: string): string {
  const secret = process.env.CONSENT_IP_HASH_SECRET ?? "dev-only-fallback";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Write a single consent log row. Idempotent in the sense that we always
 * append (never update); each toggle creates a new row, giving us full
 * history for GDPR audit ("when did the user accept marketing email?").
 */
export async function recordConsent(
  prisma: PrismaClient,
  args: RecordConsentArgs
): Promise<void> {
  await prisma.consentLog.create({
    data: {
      userId: args.userId,
      type: args.type,
      value: args.value,
      context: args.context,
      ipAddress: args.ipAddress ? hashIp(args.ipAddress) : null,
      userAgent: args.userAgent ?? null,
    },
  });
}

/**
 * Bulk variant for the signup wizard, which writes 3–4 consent rows at once.
 */
export async function recordConsents(
  prisma: PrismaClient,
  base: Omit<RecordConsentArgs, "type" | "value">,
  entries: Array<{ type: ConsentType; value: boolean }>
): Promise<void> {
  if (entries.length === 0) return;
  await prisma.consentLog.createMany({
    data: entries.map((e) => ({
      userId: base.userId,
      type: e.type,
      value: e.value,
      context: base.context,
      ipAddress: base.ipAddress ? hashIp(base.ipAddress) : null,
      userAgent: base.userAgent ?? null,
    })),
  });
}
