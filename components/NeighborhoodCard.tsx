import { prisma } from "@/lib/prisma";
import Link from "next/link";

type NeighborhoodData = {
  city: string;
  state: string;
  listingCount: number;
  commentCount: number;
  avgPrice: number;
  sentiment: "positive" | "critical" | "neutral";
};

async function getNeighborhoods(): Promise<NeighborhoodData[]> {
  // Get cities with the most listings
  const cityGroups = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: { status: "active" },
    _count: { id: true },
    _avg: { price: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  if (cityGroups.length === 0) return [];

  // For each city, get comment count and reaction sentiment
  const neighborhoods = await Promise.all(
    cityGroups.map(async (cg) => {
      const listings = await prisma.listing.findMany({
        where: { city: cg.city, state: cg.state, status: "active" },
        select: { id: true },
      });
      const listingIds = listings.map((l) => l.id);

      const [commentCount, reactions] = await Promise.all([
        prisma.comment.count({ where: { listingId: { in: listingIds } } }),
        prisma.reaction.findMany({
          where: { comment: { listingId: { in: listingIds } } },
          select: { type: true },
        }),
      ]);

      // Sentiment: fire + heart = positive, skull + surprised = critical
      let positiveCount = 0;
      let criticalCount = 0;
      for (const r of reactions) {
        if (r.type === "\u2764\uFE0F" || r.type === "\uD83D\uDD25") positiveCount++;
        if (r.type === "\uD83D\uDC80" || r.type === "\uD83D\uDE2E") criticalCount++;
      }
      const sentiment: "positive" | "critical" | "neutral" =
        positiveCount > criticalCount
          ? "positive"
          : criticalCount > positiveCount
            ? "critical"
            : "neutral";

      return {
        city: cg.city,
        state: cg.state,
        listingCount: cg._count.id,
        commentCount,
        avgPrice: Math.round(cg._avg.price ?? 0),
        sentiment,
      };
    })
  );

  // Only show neighborhoods that have at least some activity
  return neighborhoods.filter((n) => n.listingCount > 0).slice(0, 6);
}

export default async function BrowseByNeighborhood() {
  const neighborhoods = await getNeighborhoods();

  if (neighborhoods.length === 0) return null;

  return (
    <section className="my-8 sm:my-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏘️</span>
        <h2 className="font-display text-base font-bold text-ink uppercase tracking-widest">
          Browse by Neighborhood
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {neighborhoods.map((n) => (
          <NeighborhoodCard key={`${n.city}-${n.state}`} neighborhood={n} />
        ))}
      </div>
    </section>
  );
}

function NeighborhoodCard({ neighborhood: n }: { neighborhood: NeighborhoodData }) {
  const sentimentConfig = {
    positive: {
      label: "Mostly positive",
      icon: "\u2764\uFE0F",
      color: "text-money bg-green-50 border-green-200/50",
    },
    critical: {
      label: "Getting roasted",
      icon: "\uD83D\uDC80",
      color: "text-hot bg-red-50 border-red-200/50",
    },
    neutral: {
      label: "Mixed opinions",
      icon: "\uD83E\uDD14",
      color: "text-muted bg-tag border-border",
    },
  };

  const sentiment = sentimentConfig[n.sentiment];

  return (
    <Link
      href={`/?city=${encodeURIComponent(n.city)}`}
      className="group bg-[#1A1A1A] border border-border rounded-xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* City name + state */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink tracking-tight group-hover:text-social transition-colors">
            {n.city}
          </h3>
          <p className="text-[12px] text-muted">{n.state}</p>
        </div>
        {/* Sentiment badge */}
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${sentiment.color}`}>
          <span>{sentiment.icon}</span>
          {sentiment.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[12px] text-muted">
        <span>
          <span className="font-semibold text-ink">{n.listingCount}</span> listing{n.listingCount !== 1 ? "s" : ""}
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-semibold text-ink">{n.commentCount}</span> comment{n.commentCount !== 1 ? "s" : ""}
        </span>
        <span className="text-border">·</span>
        <span>
          avg <span className="font-semibold text-ink">${n.avgPrice.toLocaleString()}</span>
        </span>
      </div>

      {/* CTA */}
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-[12px] font-semibold text-social group-hover:underline">
          See what people are saying &rarr;
        </span>
      </div>
    </Link>
  );
}
