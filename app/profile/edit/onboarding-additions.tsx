/**
 * Server component to drop into the existing /profile/edit page.
 *
 * The auth/profile task owns `app/profile/edit/page.tsx`. Rather than
 * editing that file (potential merge conflict), import this component
 * inside their page:
 *
 *   import { OnboardingAdditions } from "./onboarding-additions";
 *   ...
 *   <OnboardingAdditions />
 *
 * Renders nothing for unauthenticated users.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileFieldsSection } from "@/components/profile/ProfileFieldsSection";
import { PrivacyDataSection } from "@/components/profile/PrivacyDataSection";
import "@/components/profile/profile-edit.css";
import "@/components/onboarding/onboarding.css";

export async function OnboardingAdditions() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      markets: true,
      neighborhoods: true,
      buyRentIntent: true,
      intentTimeline: true,
      budgetBand: true,
      referralSource: true,
      emailDigestCadence: true,
      showRolePublicly: true,
      showMarketsPublicly: true,
      showWatchlistPublicly: true,
      marketingConsent: true,
      personalizationConsent: true,
      pushConsent: true,
      accountDeletionRequest: {
        select: { scheduledFor: true, cancelledAt: true },
      },
      dataExportRequests: {
        where: { status: { in: ["PENDING", "RUNNING"] } },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!u) return null;

  const scheduled =
    u.accountDeletionRequest && !u.accountDeletionRequest.cancelledAt
      ? u.accountDeletionRequest.scheduledFor.toISOString()
      : null;

  return (
    <>
      <ProfileFieldsSection
        initial={{
          role: u.role,
          markets: u.markets,
          neighborhoods: u.neighborhoods,
          buyRentIntent: u.buyRentIntent,
          intentTimeline: u.intentTimeline,
          budgetBand: u.budgetBand,
          referralSource: u.referralSource,
          emailDigestCadence: u.emailDigestCadence,
          showRolePublicly: u.showRolePublicly,
          showMarketsPublicly: u.showMarketsPublicly,
          showWatchlistPublicly: u.showWatchlistPublicly,
          marketingConsent: u.marketingConsent,
          personalizationConsent: u.personalizationConsent,
          pushConsent: u.pushConsent,
        }}
      />
      <PrivacyDataSection
        scheduledDeletionAt={scheduled}
        pendingExportId={u.dataExportRequests[0]?.id ?? null}
      />
    </>
  );
}
