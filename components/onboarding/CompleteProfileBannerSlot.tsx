/**
 * Server-rendered slot to drop into the home page.
 *
 * Usage in app/(home)/page.tsx (the viral-UX task owns the home page —
 * just import and render this somewhere above the feed):
 *
 *   import { CompleteProfileBannerSlot } from "@/components/onboarding/CompleteProfileBannerSlot";
 *   ...
 *   <CompleteProfileBannerSlot />
 *
 * Returns null for unauthenticated users or users with no missing
 * Tier 2 fields, so it's safe to render unconditionally.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMissingTier2Fields } from "@/lib/onboarding/getMissingTier2Fields";
import { CompleteProfileBanner } from "./CompleteProfileBanner";
import "./tier2.css";

export async function CompleteProfileBannerSlot() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      buyRentIntent: true,
      intentTimeline: true,
      budgetBand: true,
      referralSource: true,
      emailDigestCadence: true,
      onboardingCompletedAt: true,
    },
  });
  if (!u) return null;
  // Tier 1 not done: send to the wizard, no banner.
  if (!u.onboardingCompletedAt) return null;

  const missing = getMissingTier2Fields(u);
  if (missing.length === 0) return null;

  return <CompleteProfileBanner role={u.role} missingFields={missing} />;
}
