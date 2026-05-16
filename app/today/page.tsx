/**
 * /today — the daily-reset front page.
 *
 * A bookmark-able URL that re-ranks every minute and renders a fresh "top of
 * the world" view of the hottest takes from the last 24 hours. People should
 * open this every morning the way they once opened Drudge.
 *
 * Architecture:
 *   - Server component. All heavy lifting (Prisma + ranking) happens here.
 *   - `unstable_cache` keyed on `today:<YYYY-MM-DD>` with a 60s TTL, so
 *     subsequent visits within the same minute hit memory, and the cache
 *     auto-invalidates when the calendar day rolls over.
 *   - ISR backstop via `export const revalidate = 60`.
 *   - Small client children: CountdownCard (live midnight ticker) and
 *     SubscribePulse (form POST to /api/subscribe).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import TodayHero from "@/components/today/TodayHero";
import RankedTake, { type RankedTakeInput } from "@/components/today/RankedTake";
import HotListings, { type HotListingItem } from "@/components/today/HotListings";
import SubscribePulse from "@/components/today/SubscribePulse";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Today on Gwaky — the spiciest takes on real estate",
  description:
    "Updated every minute. The takes everyone's talking about, the listings catching fire, the agents on notice.",
  alternates: { canonical: "/today" },
  openGraph: {
    title: "Today on Gwaky — the spiciest takes on real estate",
    description:
      "Updated every minute. The takes everyone's talking about, the listings catching fire, the agents on notice.",
    url: "https://gwaky.com/today",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Today on Gwaky — the spiciest takes on real estate",
    description:
      "Updated every minute. The takes everyone's talking about, the listings catching fire, the agents on notice.",
  },
};

// ── Types ────────────────────────────────────────────────────────────

type Neighborhood = { city: string; state: string; count: number };

interface TodayData {
  topTakes: RankedTakeInput[];
  hotListings: HotListingItem[];
  totalTakes: number;
  totalListings: number;
  redFlagCount: number;
  neighborhoods: Neighborhood[];
}

// ── Data layer ───────────────────────────────────────────────────────

/**
 * Fetch + rank everything the page needs in one shot. Cached for 60s and
 * automatically invalidated when the calendar date changes (key includes it).
 */
async function fetchTodayData(dateKey: string): Promise<TodayData> {
  const cacheKey = ["today", dateKey];
  return unstable_cache(
    async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        commentPool,
        topListingsAgg,
        totalTakes,
        redFlagCount,
        neighborhoodAgg,
        distinctListingRows,
      ] = await Promise.all([
        // 1) Pull a wide pool of recent comments — we score them in JS so we
        //    can express the recency-boost cleanly. 200 is more than enough
        //    to find the top 20 by heat.
        prisma.comment.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            id: true,
            content: true,
            name: true,
            createdAt: true,
            isRedFlag: true,
            likeCount: true,
            listing: {
              select: {
                id: true,
                address: true,
                city: true,
                state: true,
                price: true,
                listingType: true,
                photos: true,
              },
            },
            user: { select: { name: true, username: true } },
            _count: { select: { reactions: true } },
          },
        }),
        // 2) Top listings by comment count in last 24h.
        prisma.comment.groupBy({
          by: ["listingId"],
          where: { createdAt: { gte: since } },
          _count: { _all: true },
          orderBy: { _count: { listingId: "desc" } },
          take: 5,
        }),
        prisma.comment.count({ where: { createdAt: { gte: since } } }),
        prisma.comment.count({
          where: { createdAt: { gte: since }, isRedFlag: true },
        }),
        // 4) Hot neighborhoods — group comments by listing city.
        //    No direct comment.city column, so we group through a raw query.
        prisma.$queryRaw<Array<{ city: string; state: string; count: bigint }>>`
          SELECT l.city, l.state, COUNT(c.id)::bigint AS count
          FROM "Comment" c
          JOIN "Listing" l ON l.id = c."listingId"
          WHERE c."createdAt" >= ${since}
          GROUP BY l.city, l.state
          ORDER BY count DESC
          LIMIT 5
        `,
        // Distinct listings discussed in last 24h — small projection so we
        // can count them in JS without a second round-trip after the rank.
        prisma.comment.findMany({
          where: { createdAt: { gte: since } },
          distinct: ["listingId"],
          select: { listingId: true },
        }),
      ]);

      // Score and rank takes.
      const now = Date.now();
      const scored = commentPool
        .map((c) => {
          const ageHours = (now - c.createdAt.getTime()) / 3_600_000;
          const recencyBoost = ageHours < 4 ? 15 - ageHours * 2 : 0; // up to +15 for <4h-old takes
          const heatScore =
            c.likeCount * 2 + c._count.reactions + Math.max(0, recencyBoost);
          return { c, heatScore };
        })
        .sort((a, b) => b.heatScore - a.heatScore)
        .slice(0, 20);

      const topTakes: RankedTakeInput[] = scored.map(({ c, heatScore }, i) => ({
        id: c.id,
        rank: i + 1,
        content: c.content,
        authorName: c.user?.name || c.user?.username || c.name || "Anonymous",
        createdAt: c.createdAt,
        isRedFlag: c.isRedFlag,
        likeCount: c.likeCount,
        reactionCount: c._count.reactions,
        heatScore,
        listing: {
          id: c.listing.id,
          address: c.listing.address,
          city: c.listing.city,
          state: c.listing.state,
          price: c.listing.price,
          listingType: c.listing.listingType,
          photo: c.listing.photos[0] ?? null,
        },
      }));

      // Hydrate top-listings groupBy result into full Listing rows.
      const topListingIds = topListingsAgg.map((g) => g.listingId);
      const listingRows = topListingIds.length
        ? await prisma.listing.findMany({
            where: { id: { in: topListingIds } },
            select: {
              id: true,
              address: true,
              city: true,
              state: true,
              price: true,
              listingType: true,
              photos: true,
              _count: { select: { comments: true } },
            },
          })
        : [];
      const listingById = new Map(listingRows.map((l) => [l.id, l]));
      const hotListings: HotListingItem[] = topListingsAgg.flatMap((g) => {
        const l = listingById.get(g.listingId);
        if (!l) return [];
        const item: HotListingItem = {
          id: l.id,
          address: l.address,
          city: l.city,
          state: l.state,
          price: l.price,
          listingType: l.listingType,
          photo: l.photos[0] ?? null,
          takes24h: g._count._all,
        };
        return [item];
      });

      const neighborhoods: Neighborhood[] = neighborhoodAgg.map((n) => ({
        city: n.city,
        state: n.state,
        count: Number(n.count),
      }));

      const totalListings = distinctListingRows.length;

      return {
        topTakes,
        hotListings,
        totalTakes,
        totalListings,
        redFlagCount,
        neighborhoods,
      };
    },
    cacheKey,
    { revalidate: 60, tags: ["today"] },
  )();
}

// ── Helpers ──────────────────────────────────────────────────────────

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function citySlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function TodayPage() {
  // Optional auth — currently we don't personalize the list, but keeping
  // the call wired so we can read session-driven flags later without a
  // breaking change.
  await auth().catch(() => null);

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD — cache rolls over at UTC midnight
  const dateLabel = fmtDateLong(now);

  const data = await fetchTodayData(dateKey);

  // Compute time-to-midnight on the server for an immediate, no-flash
  // first paint; the client component hydrates and keeps the value live.
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hoursToMidnight = Math.floor(diffMs / 3_600_000);
  const minutesToMidnight = Math.floor((diffMs % 3_600_000) / 60_000);

  const topTen = data.topTakes.slice(0, 10);

  return (
    <main className="min-h-screen bg-bg pb-24">
      {/* 1. Hero */}
      <TodayHero
        dateLabel={dateLabel}
        totalTakes={data.totalTakes}
        totalListings={data.totalListings}
        redFlagCount={data.redFlagCount}
        hoursToMidnight={hoursToMidnight}
        minutesToMidnight={minutesToMidnight}
      />

      {/* 3. The List — top 10 takes */}
      <section className="px-5 pt-6">
        <header className="mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-tight">
            The list.
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Ranked by heat. Pulled from the last 24 hours. Refreshed every minute.
          </p>
        </header>

        {topTen.length === 0 ? (
          <div className="rounded-2xl border border-divider/60 bg-surface p-6 text-center">
            <p className="text-base font-semibold text-ink mb-1">
              The kettle hasn&apos;t whistled yet today.
            </p>
            <p className="text-sm text-secondary">
              Check back in a bit — or be the first to spill.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {topTen.map((t) => (
              <li key={t.id}>
                <RankedTake take={t} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 4. Listings on fire */}
      <HotListings items={data.hotListings} />

      {/* 5. Hot neighborhoods */}
      {data.neighborhoods.length > 0 && (
        <section className="px-5 pt-6 pb-2">
          <header className="mb-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-tight">
              Neighborhoods making noise
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Where the takes are landing today.
            </p>
          </header>
          <div className="flex flex-wrap gap-2">
            {data.neighborhoods.map((n) => (
              <Link
                key={`${n.city}-${n.state}`}
                href={`/city/${citySlug(n.city)}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-divider/60 hover:border-amber/40 text-sm transition-colors"
              >
                <span className="font-bold text-ink">{n.city}</span>
                <span className="text-tertiary">{n.state}</span>
                <span className="text-xs font-bold text-amber tabular-nums">
                  · {n.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Yesterday's leftovers (stub) */}
      <section className="px-5 pt-8">
        <Link
          href="/today?d=yesterday"
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-amber transition-colors"
        >
          <span aria-hidden="true">←</span>
          Catch up on yesterday
        </Link>
      </section>

      {/* 7. Subscribe pulse */}
      <section className="px-5 pt-6">
        <SubscribePulse />
      </section>
    </main>
  );
}
