import type { Tier2Field } from "@/components/onboarding/CompleteProfileBanner";
import type { User } from "@prisma/client";

/**
 * Determine which Tier 2 fields are still empty for a given user.
 * Used by the home page (server component) to decide whether to render
 * the carrot banner and which questions to surface in the modal.
 *
 * Skipped questions don't write to the User row, so the banner will
 * keep offering them until the user dismisses (per session) or fills
 * them in.
 */
export function getMissingTier2Fields(
  u: Pick<
    User,
    | "buyRentIntent"
    | "intentTimeline"
    | "budgetBand"
    | "referralSource"
    | "emailDigestCadence"
    | "role"
  >
): Tier2Field[] {
  const out: Tier2Field[] = [];
  const isShopper = u.role === "RENTER" || u.role === "BUYER";
  if (isShopper && !u.buyRentIntent) out.push("intent");
  if (isShopper && !u.intentTimeline) out.push("timeline");
  if (isShopper && !u.budgetBand) out.push("budget");
  if (!u.referralSource) out.push("referral");
  // emailDigestCadence has a default of WEEKLY, so only ask if explicitly null.
  if (u.emailDigestCadence == null) out.push("notifications");
  return out;
}
