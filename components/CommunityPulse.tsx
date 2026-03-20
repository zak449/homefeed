import { prisma } from "@/lib/prisma";

export default async function CommunityPulse() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [
    commentsToday,
    commentsThisWeek,
    commentsPrevWeek,
    reactionsThisWeek,
    reactionsPrevWeek,
    topCities,
    topContributors,
  ] = await Promise.all([
    // Comments today
    prisma.comment.count({ where: { createdAt: { gte: todayStart } } }),
    // Comments this week
    prisma.comment.count({ where: { createdAt: { gte: weekAgo } } }),
    // Comments previous week (for trend)
    prisma.comment.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    // Reactions this week
    prisma.reaction.count({ where: { createdAt: { gte: weekAgo } } }),
    // Reactions previous week
    prisma.reaction.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    // Most active cities this week (via comments on listings)
    prisma.comment.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: {
        listing: { select: { city: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }).then((comments) => {
      const cityMap: Record<string, number> = {};
      for (const c of comments) {
        const key = `${c.listing.city}, ${c.listing.state}`;
        cityMap[key] = (cityMap[key] || 0) + 1;
      }
      return Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([city, count]) => ({ city, count }));
    }),
    // Top contributors this week
    prisma.comment.groupBy({
      by: ["name"],
      where: { createdAt: { gte: weekAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  const commentTrendUp = commentsThisWeek >= commentsPrevWeek;
  const reactionTrendUp = reactionsThisWeek >= reactionsPrevWeek;

  // If there's basically no activity, don't render
  if (commentsThisWeek === 0 && reactionsThisWeek === 0) return null;

  return (
    <section className="my-8 sm:my-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-social live-dot" />
        <h2 className="font-display text-base font-bold text-ink uppercase tracking-widest">
          Community Pulse
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat: Comments Today */}
        <div className="bg-white border border-border rounded-xl p-4 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Today</span>
            <span className="text-lg">💬</span>
          </div>
          <p className="font-display text-2xl font-bold text-ink tracking-tight">
            {commentsToday}
          </p>
          <p className="text-[12px] text-muted mt-0.5">
            comment{commentsToday !== 1 ? "s" : ""} posted
          </p>
        </div>

        {/* Stat: Comments This Week */}
        <div className="bg-white border border-border rounded-xl p-4 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">This Week</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              commentTrendUp
                ? "text-money bg-green-50"
                : "text-hot bg-red-50"
            }`}>
              {commentTrendUp ? "\u2191" : "\u2193"} {commentTrendUp ? "Up" : "Down"}
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-ink tracking-tight">
            {commentsThisWeek}
          </p>
          <p className="text-[12px] text-muted mt-0.5">
            opinions shared
          </p>
        </div>

        {/* Stat: Reactions This Week */}
        <div className="bg-white border border-border rounded-xl p-4 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Reactions</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              reactionTrendUp
                ? "text-money bg-green-50"
                : "text-hot bg-red-50"
            }`}>
              {reactionTrendUp ? "\u2191" : "\u2193"} {reactionTrendUp ? "Up" : "Down"}
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-ink tracking-tight">
            {reactionsThisWeek}
          </p>
          <p className="text-[12px] text-muted mt-0.5">
            reactions this week
          </p>
        </div>

        {/* Most Active Cities */}
        <div className="bg-white border border-border rounded-xl p-4 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Hottest Markets</span>
            <span className="text-lg">📍</span>
          </div>
          {topCities.length > 0 ? (
            <ul className="space-y-1.5">
              {topCities.map((c, i) => (
                <li key={c.city} className="flex items-center justify-between">
                  <span className="text-[13px] text-ink font-medium truncate">
                    <span className="text-muted mr-1.5">{i + 1}.</span>
                    {c.city}
                  </span>
                  <span className="text-[11px] text-social font-bold shrink-0">
                    {c.count} {c.count === 1 ? "take" : "takes"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-muted">No city data yet</p>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="mt-3 bg-white border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider shrink-0">
              Top Voices
            </span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {topContributors.map((tc) => (
                <span
                  key={tc.name}
                  className="inline-flex items-center gap-1.5 bg-tag px-3 py-1.5 rounded-full shrink-0"
                >
                  <span className="w-5 h-5 rounded-full bg-social/20 text-social text-[10px] font-bold flex items-center justify-center">
                    {tc.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-ink">{tc.name}</span>
                  <span className="text-[10px] text-muted">{tc._count.id} takes</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
