import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────────────
 * Auth / role gate
 *
 * Allowed if EITHER:
 *  - session user email matches ADMIN_EMAILS (hardcoded — Zak's account)
 *  - session.user.role === "ADMIN" (if added in the future)
 *
 * Anyone else gets bounced to home.
 * ──────────────────────────────────────────────────────────────────── */

const ADMIN_EMAILS = new Set<string>([
  "zak@communityattire.com",
]);

function isAdmin(session: { user?: { email?: string | null; role?: string | null } } | null) {
  if (!session?.user) return false;
  if (session.user.email && ADMIN_EMAILS.has(session.user.email)) return true;
  if (session.user.role === "ADMIN") return true;
  return false;
}

/* ─────────────────────────────────────────────────────────────────────
 * Small presentational primitives
 * ──────────────────────────────────────────────────────────────────── */

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

type TopListingRow = {
  listingId: string;
  count: bigint | number;
  address: string | null;
  city: string | null;
};

export const dynamic = "force-dynamic";

export default async function AnalyticsAdminPage() {
  const session = await auth();
  if (!isAdmin(session as Parameters<typeof isAdmin>[0])) {
    redirect("/");
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    signups24h,
    signups7d,
    signups30d,
    totalListings,
    totalComments,
    activeUsers7d,
    onboardedUsers,
    marketingGranted,
    personalizationGranted,
    pushGranted,
    tosAccepted,
    privacyAccepted,
    dataProcessingAccepted,
    topListingsRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({ where: { createdAt: { gte: since30d } } }),
    prisma.listing.count(),
    prisma.comment.count(),
    // "Active" = users with a session refreshed in the last 7d. The Session
    // model uses `expires`, which is pushed forward on every request — a
    // close-enough proxy for "logged in this week".
    prisma.session
      .findMany({
        where: { expires: { gte: since7d } },
        distinct: ["userId"],
        select: { userId: true },
      })
      .then((r) => r.length),
    prisma.user.count({ where: { onboardingCompletedAt: { not: null } } }),
    prisma.user.count({ where: { marketingConsent: true } }),
    prisma.user.count({ where: { personalizationConsent: true } }),
    prisma.user.count({ where: { pushConsent: true } }),
    prisma.user.count({ where: { tosAcceptedAt: { not: null } } }),
    prisma.user.count({ where: { privacyPolicyAcceptedAt: { not: null } } }),
    prisma.user.count({ where: { dataProcessingConsentedAt: { not: null } } }),
    prisma.$queryRaw<TopListingRow[]>`
      SELECT
        c."listingId"          AS "listingId",
        COUNT(*)::int          AS count,
        MAX(l."address")       AS address,
        MAX(l."city")          AS city
      FROM "Comment" c
      LEFT JOIN "Listing" l ON l.id = c."listingId"
      WHERE c."createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY c."listingId"
      ORDER BY count DESC
      LIMIT 5
    `,
  ]);

  const pct = (n: number) =>
    totalUsers === 0 ? "0%" : `${Math.round((n / totalUsers) * 100)}%`;

  const onboardingRate = pct(onboardedUsers);

  const consentRows: { label: string; granted: number }[] = [
    { label: "Terms of Service", granted: tosAccepted },
    { label: "Privacy Policy", granted: privacyAccepted },
    { label: "Marketing", granted: marketingGranted },
    { label: "Personalization", granted: personalizationGranted },
    { label: "Push Notifications", granted: pushGranted },
    { label: "Data Processing", granted: dataProcessingAccepted },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gwaky Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Real-time event data (pageviews, search, listing views, comment
          interactions) lives in PostHog — this dashboard covers DB-derived
          aggregates only.
        </p>
      </div>

      {/* Top-line counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Users" value={totalUsers} />
        <MetricCard label="Total Listings" value={totalListings} />
        <MetricCard label="Total Comments" value={totalComments} />
        <MetricCard
          label="Active Users (7d)"
          value={activeUsers7d}
          hint="distinct sessions still valid"
        />
      </div>

      {/* Signup funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <MetricCard label="Signups (24h)" value={signups24h} />
        <MetricCard label="Signups (7d)" value={signups7d} />
        <MetricCard label="Signups (30d)" value={signups30d} />
        <MetricCard
          label="Onboarding Completion"
          value={onboardingRate}
          hint={`${onboardedUsers.toLocaleString()} / ${totalUsers.toLocaleString()}`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Top commented listings */}
        <Section title="Top 5 Most-Commented Listings (Last 7d)">
          {topListingsRaw.length === 0 ? (
            <p className="text-gray-600 text-sm">No comments in the last 7 days.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left pb-2">#</th>
                  <th className="text-left pb-2">Listing</th>
                  <th className="text-right pb-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {topListingsRaw.map((row, i) => (
                  <tr key={row.listingId} className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 text-gray-300">
                      <div className="truncate max-w-[280px]">
                        {row.address || row.listingId}
                      </div>
                      {row.city ? (
                        <div className="text-xs text-gray-600">{row.city}</div>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-mono text-white">
                      {Number(row.count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Consent breakdown */}
        <Section title="Consent Breakdown">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <th className="text-left pb-2">Consent</th>
                <th className="text-right pb-2">Granted</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody>
              {consentRows.map((r) => (
                <tr key={r.label} className="border-b border-gray-800/50">
                  <td className="py-2 text-gray-300">{r.label}</td>
                  <td className="py-2 text-right font-mono text-white">
                    {r.granted.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-gray-400">{pct(r.granted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-3">
            Marketing is privacy-by-default — low marketing % is expected.
          </p>
        </Section>
      </div>

      <p className="text-center text-gray-700 text-xs mt-10">
        Internal use only. For pageviews, funnels, retention &amp; real-time
        events, see PostHog.
      </p>
    </div>
  );
}
