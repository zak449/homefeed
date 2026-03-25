import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types for raw queries                                              */
/* ------------------------------------------------------------------ */

interface DayCount {
  day: Date;
  count: number;
}

interface TopListing {
  listingId: string;
  count: number;
  address: string | null;
}

interface SearchRow {
  query: string;
  createdAt: Date;
}

interface ReactionRow {
  type: string;
  count: number;
}

interface CityCount {
  city: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Helper — simple date formatting                                    */
/* ------------------------------------------------------------------ */

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Bar chart component                                                */
/* ------------------------------------------------------------------ */

function Bar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-gray-400 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-sm text-white font-mono text-right shrink-0">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

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

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */

export default async function AnalyticsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;

  /* ---------- password gate ---------- */
  if (params.key !== "gwaky2026") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-red-500 text-xl font-semibold">Unauthorized</p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  /* Scalar counts */
  const [
    totalPageViews,
    uniqueVisitorsToday,
    totalTakes,
    totalReactions,
    totalListings,
    emailSubscribers,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "page_view" } }),
    prisma.analyticsEvent
      .findMany({
        where: { type: "page_view", createdAt: { gte: todayStart } },
        distinct: ["anonId"],
        select: { anonId: true },
      })
      .then((r) => r.length),
    prisma.comment.count(),
    prisma.reaction.count(),
    prisma.listing.count(),
    prisma.subscriber.count(),
  ]);

  /* Daily traffic (last 7 days) */
  const dailyViews = await prisma.$queryRaw<DayCount[]>`
    SELECT DATE("createdAt") as day, COUNT(*)::int as count
    FROM "AnalyticsEvent"
    WHERE type = 'page_view'
      AND "createdAt" > NOW() - INTERVAL '7 days'
    GROUP BY DATE("createdAt")
    ORDER BY day DESC
  `;

  /* Daily unique visitors (last 7 days) */
  const dailyUniques = await prisma.$queryRaw<DayCount[]>`
    SELECT DATE("createdAt") as day, COUNT(DISTINCT "anonId")::int as count
    FROM "AnalyticsEvent"
    WHERE "createdAt" > NOW() - INTERVAL '7 days'
    GROUP BY DATE("createdAt")
    ORDER BY day DESC
  `;

  /* Takes per day (last 7 days) */
  const dailyTakes = await prisma.$queryRaw<DayCount[]>`
    SELECT DATE("createdAt") as day, COUNT(*)::int as count
    FROM "Comment"
    WHERE "createdAt" > NOW() - INTERVAL '7 days'
    GROUP BY DATE("createdAt")
    ORDER BY day DESC
  `;

  /* Top viewed listings */
  const topListings = await prisma.$queryRaw<TopListing[]>`
    SELECT
      ae.data->>'listingId' as "listingId",
      COUNT(*)::int as count,
      MAX(l."address") as address
    FROM "AnalyticsEvent" ae
    LEFT JOIN "Listing" l ON l.id = ae.data->>'listingId'
    WHERE ae.type = 'listing_view'
      AND ae.data->>'listingId' IS NOT NULL
    GROUP BY ae.data->>'listingId'
    ORDER BY count DESC
    LIMIT 10
  `;

  /* Recent searches */
  const recentSearches = await prisma.$queryRaw<SearchRow[]>`
    SELECT data->>'query' as query, "createdAt"
    FROM "AnalyticsEvent"
    WHERE type = 'search'
      AND data->>'query' IS NOT NULL
    ORDER BY "createdAt" DESC
    LIMIT 20
  `;

  /* Latest takes */
  const latestTakes = await prisma.comment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { address: true } } },
  });

  /* Subscribers */
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  /* Reactions breakdown */
  const reactionsBreakdown = await prisma.$queryRaw<ReactionRow[]>`
    SELECT type, COUNT(*)::int as count
    FROM "Reaction"
    GROUP BY type
    ORDER BY count DESC
  `;

  /* Comments by city */
  const commentsByCity = await prisma.$queryRaw<CityCount[]>`
    SELECT l.city, COUNT(*)::int as count
    FROM "Comment" c
    JOIN "Listing" l ON l.id = c."listingId"
    GROUP BY l.city
    ORDER BY count DESC
    LIMIT 10
  `;

  /* Chart helpers */
  const maxViews = Math.max(...dailyViews.map((d) => d.count), 1);
  const maxUniques = Math.max(...dailyUniques.map((d) => d.count), 1);
  const maxTakes = Math.max(...dailyTakes.map((d) => d.count), 1);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gwaky Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ── Key Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <MetricCard label="Total Page Views" value={totalPageViews} />
        <MetricCard label="Unique Visitors Today" value={uniqueVisitorsToday} />
        <MetricCard label="Total Takes" value={totalTakes} />
        <MetricCard label="Total Reactions" value={totalReactions} />
        <MetricCard label="Total Listings" value={totalListings} />
        <MetricCard label="Email Subscribers" value={emailSubscribers} />
      </div>

      {/* ── Charts ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Section title="Daily Traffic (Last 7 Days)">
          <div className="space-y-2">
            {dailyViews.length === 0 && (
              <p className="text-gray-600 text-sm">No data yet</p>
            )}
            {dailyViews.map((row) => (
              <Bar
                key={String(row.day)}
                label={fmtDate(new Date(row.day))}
                value={row.count}
                maxValue={maxViews}
              />
            ))}
          </div>
        </Section>

        <Section title="Daily Unique Visitors">
          <div className="space-y-2">
            {dailyUniques.length === 0 && (
              <p className="text-gray-600 text-sm">No data yet</p>
            )}
            {dailyUniques.map((row) => (
              <Bar
                key={String(row.day)}
                label={fmtDate(new Date(row.day))}
                value={row.count}
                maxValue={maxUniques}
              />
            ))}
          </div>
        </Section>

        <Section title="Takes Per Day">
          <div className="space-y-2">
            {dailyTakes.length === 0 && (
              <p className="text-gray-600 text-sm">No data yet</p>
            )}
            {dailyTakes.map((row) => (
              <Bar
                key={String(row.day)}
                label={fmtDate(new Date(row.day))}
                value={row.count}
                maxValue={maxTakes}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* ── Tables ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Top Viewed Listings */}
        <Section title="Top Viewed Listings">
          {topListings.length === 0 ? (
            <p className="text-gray-600 text-sm">No listing views tracked yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left pb-2">#</th>
                  <th className="text-left pb-2">Address</th>
                  <th className="text-right pb-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {topListings.map((row, i) => (
                  <tr
                    key={row.listingId}
                    className="border-b border-gray-800/50"
                  >
                    <td className="py-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 text-gray-300 truncate max-w-[200px]">
                      {row.address || row.listingId}
                    </td>
                    <td className="py-2 text-right font-mono text-white">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Recent Searches */}
        <Section title="Recent Searches">
          {recentSearches.length === 0 ? (
            <p className="text-gray-600 text-sm">No searches yet</p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {recentSearches.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-1 border-b border-gray-800/50"
                >
                  <span className="text-gray-300 truncate mr-4">
                    {row.query}
                  </span>
                  <span className="text-gray-600 text-xs whitespace-nowrap">
                    {fmtDateTime(new Date(row.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Latest Takes */}
        <Section title="Latest Takes">
          {latestTakes.length === 0 ? (
            <p className="text-gray-600 text-sm">No takes yet</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {latestTakes.map((c) => (
                <div
                  key={c.id}
                  className="text-sm border-b border-gray-800/50 pb-2"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-orange-400">
                      {c.name}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {fmtDateTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300">
                    {c.content.length > 60
                      ? c.content.slice(0, 60) + "..."
                      : c.content}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {c.listing.address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Subscribers */}
        <Section title="Subscribers">
          {subscribers.length === 0 ? (
            <p className="text-gray-600 text-sm">No subscribers yet</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="text-left pb-2">Email</th>
                    <th className="text-left pb-2">Source</th>
                    <th className="text-right pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-800/50"
                    >
                      <td className="py-1.5 text-gray-300 truncate max-w-[180px]">
                        {s.email}
                      </td>
                      <td className="py-1.5">
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {s.source || "unknown"}
                        </span>
                      </td>
                      <td className="py-1.5 text-right text-gray-600 text-xs">
                        {fmtDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* ── Engagement ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Reactions Breakdown */}
        <Section title="Reactions Breakdown">
          {reactionsBreakdown.length === 0 ? (
            <p className="text-gray-600 text-sm">No reactions yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {reactionsBreakdown.map((r) => (
                <div
                  key={r.type}
                  className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2"
                >
                  <span className="text-lg">{r.type}</span>
                  <span className="text-sm font-mono text-white">
                    {r.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Comments by City */}
        <Section title="Comments by City">
          {commentsByCity.length === 0 ? (
            <p className="text-gray-600 text-sm">No comments yet</p>
          ) : (
            <div className="space-y-2">
              {commentsByCity.map((row) => (
                <Bar
                  key={row.city}
                  label={row.city}
                  value={row.count}
                  maxValue={Math.max(...commentsByCity.map((r) => r.count), 1)}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-700 text-xs mt-10">
        Gwaky Analytics Dashboard — Internal Use Only
      </p>
    </div>
  );
}
