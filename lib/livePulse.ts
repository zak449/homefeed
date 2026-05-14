/**
 * livePulse — server-side recent activity feed used by the homepage ticker.
 *
 * Goal: a tiny array of "this place is alive RIGHT NOW" messages we can drop
 * into a horizontal pill strip at the top of the home feed. Each pulse is
 * short, human-toned, and tappable (href).
 *
 * Data sources, in priority order:
 *   1. Real Comment rows from the last hour (or 24h fallback).
 *   2. Comment count buckets aggregated by city / neighborhood.
 *   3. Brand-new Listing rows (no comments yet — "be the first").
 *   4. Soft seeded fallbacks when the DB is sparse, keyed off the
 *      user's city so the strip never looks empty.
 *
 * Caching:
 *   We export `revalidate = 60` so the page consuming this can opt into
 *   minute-level ISR via `export const revalidate = ...` at the route
 *   level. For tighter control we also call `unstable_cache` with a 60s
 *   TTL so adjacent server components asking for the same city don't
 *   re-hit the DB.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type LivePulseKind =
  | "fresh-take"
  | "user-action"
  | "neighborhood-buzz"
  | "new-listing"
  | "pulse";

export type LivePulse = {
  id: string;
  kind: LivePulseKind;
  text: string;
  icon?: string;
  href?: string;
  weight?: number;
};

export type ComputeLivePulsesOpts = {
  userCity?: string | null;
  limit?: number;
};

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

/* ── small helpers ───────────────────────────────────────────── */

function firstName(name: string | null | undefined): string {
  if (!name) return "Someone";
  const parts = name.trim().split(/\s+/);
  return parts[0] || "Someone";
}

function shortAddress(address: string | null | undefined): string {
  if (!address) return "a listing";
  return address.split(",")[0]?.trim() || address;
}

/** Classify a comment body into a vibe verb so the ticker reads human. */
function classifyTake(content: string): { icon: string; verb: string } {
  const lower = content.toLowerCase();
  if (/\$|\bprice\b|\boverpriced\b|\bworth\b|\bdeal\b/.test(lower)) {
    return { icon: "\u{1F4B0}", verb: "dropped a price check on" };
  }
  if (/\bred flag\b|\bsketch\b|\bavoid\b|\bdon'?t\b|\bnope\b/.test(lower)) {
    return { icon: "\u{1F480}", verb: "called out red flags on" };
  }
  if (/\bneighbor\b|\bblock\b|\bquiet\b|\bnoise\b|\bnoisy\b/.test(lower)) {
    return { icon: "\u{1F441}\u{FE0F}", verb: "spilled neighborhood intel on" };
  }
  if (/\brent\b|\btenant\b|\blease\b|\blandlord\b/.test(lower)) {
    return { icon: "\u{1F511}", verb: "shared renter intel on" };
  }
  return { icon: "\u{1F525}", verb: "just spilled on" };
}

/* ── core computation ───────────────────────────────────────── */

async function computeLivePulsesUncached(
  opts: ComputeLivePulsesOpts,
): Promise<LivePulse[]> {
  const limit = opts.limit ?? 5;
  const userCity = opts.userCity?.trim() || null;
  const now = Date.now();
  const oneHourAgo = new Date(now - ONE_HOUR_MS);
  const oneDayAgo = new Date(now - ONE_DAY_MS);

  const cityFilter = userCity
    ? { listing: { city: { equals: userCity, mode: "insensitive" as const } } }
    : {};

  // Best-effort parallel reads. Every branch wrapped in catch so a single
  // table issue never kills the homepage.
  const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await p;
    } catch {
      return fallback;
    }
  };

  const [
    recentTakesNearby,
    nearbyTakeCountHour,
    nearbyTakeCountDay,
    newListingNearby,
    topCityByDay,
  ] = await Promise.all([
    safe(
      prisma.comment.findMany({
        where: {
          createdAt: { gt: oneDayAgo },
          ...cityFilter,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
          listing: {
            select: { id: true, address: true, city: true, neighborhood: true },
          },
        },
      }),
      [] as Array<{
        id: string;
        name: string;
        content: string;
        createdAt: Date;
        listing: {
          id: string;
          address: string;
          city: string;
          neighborhood: string | null;
        };
      }>,
    ),
    safe(
      prisma.comment.count({
        where: { createdAt: { gt: oneHourAgo }, ...cityFilter },
      }),
      0,
    ),
    safe(
      prisma.comment.count({
        where: { createdAt: { gt: oneDayAgo }, ...cityFilter },
      }),
      0,
    ),
    safe(
      prisma.listing.findFirst({
        where: {
          status: "active",
          createdAt: { gt: oneDayAgo },
          ...(userCity
            ? { city: { equals: userCity, mode: "insensitive" as const } }
            : {}),
          comments: { none: {} },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          address: true,
          city: true,
          neighborhood: true,
        },
      }),
      null,
    ),
    // Only ask for top-city when we DON'T already have a user city — used to
    // suggest a destination for non-geo users.
    userCity
      ? Promise.resolve(null)
      : safe(
          prisma.comment
            .groupBy({
              by: ["listingId"],
              where: { createdAt: { gt: oneDayAgo } },
              _count: { _all: true },
              orderBy: { _count: { listingId: "desc" } },
              take: 1,
            })
            .then(async (rows) => {
              if (rows.length === 0) return null;
              const top = await prisma.listing.findUnique({
                where: { id: rows[0].listingId },
                select: { city: true, neighborhood: true },
              });
              return top ? { ...top, count: rows[0]._count._all } : null;
            }),
          null,
        ),
  ]);

  const pulses: LivePulse[] = [];

  /* 1. The most recent take — gives a real human anchor. */
  if (recentTakesNearby.length > 0) {
    const top = recentTakesNearby[0];
    const { icon, verb } = classifyTake(top.content);
    pulses.push({
      id: `take-${top.id}`,
      kind: "user-action",
      icon,
      text: `${firstName(top.name)} ${verb} ${shortAddress(top.listing.address)}`,
      href: `/listing/${top.listing.id}#comment-${top.id}`,
      weight: 100,
    });
  }

  /* 2. Volume-in-the-last-hour signal — "X new takes near you". */
  if (nearbyTakeCountHour >= 2) {
    pulses.push({
      id: `hour-${nearbyTakeCountHour}`,
      kind: "fresh-take",
      icon: "\u{1F525}",
      text: userCity
        ? `${nearbyTakeCountHour} new takes near you in the last hour`
        : `${nearbyTakeCountHour} new takes in the last hour`,
      href: "/?sort=new",
      weight: 90,
    });
  } else if (nearbyTakeCountDay >= 5) {
    pulses.push({
      id: `day-${nearbyTakeCountDay}`,
      kind: "neighborhood-buzz",
      icon: "\u{1F4CD}",
      text: userCity
        ? `Activity in ${userCity} — ${nearbyTakeCountDay} takes today`
        : `${nearbyTakeCountDay} takes shared today`,
      href: userCity
        ? `/?city=${encodeURIComponent(userCity)}`
        : "/?sort=new",
      weight: 80,
    });
  }

  /* 3. A second human anchor if we have one — variety keeps rotation alive. */
  if (recentTakesNearby.length > 1) {
    const second = recentTakesNearby[1];
    const { icon, verb } = classifyTake(second.content);
    pulses.push({
      id: `take-${second.id}`,
      kind: "user-action",
      icon,
      text: `${firstName(second.name)} ${verb} ${shortAddress(second.listing.address)}`,
      href: `/listing/${second.listing.id}#comment-${second.id}`,
      weight: 70,
    });
  }

  /* 4. Brand-new listing with no takes yet — "be the first" CTA. */
  if (newListingNearby) {
    pulses.push({
      id: `newlisting-${newListingNearby.id}`,
      kind: "new-listing",
      icon: "\u{1F195}",
      text: `New listing on ${shortAddress(newListingNearby.address)} — be the first`,
      href: `/listing/${newListingNearby.id}`,
      weight: 60,
    });
  }

  /* 5. Where else is the buzz? — only when user has no city. */
  if (!userCity && topCityByDay) {
    const place =
      topCityByDay.neighborhood?.trim() || topCityByDay.city?.trim() || null;
    if (place) {
      pulses.push({
        id: `topcity-${place}`,
        kind: "neighborhood-buzz",
        icon: "\u{1F4CD}",
        text: `${topCityByDay.count} takes hitting ${place} today`,
        href: `/?city=${encodeURIComponent(place)}`,
        weight: 50,
      });
    }
  }

  /* 6. Soft seeded fallbacks — never let the strip be empty. */
  if (pulses.length === 0) {
    if (userCity) {
      pulses.push({
        id: `seed-city-${userCity}`,
        kind: "pulse",
        icon: "\u{1F4CD}",
        text: `New activity in ${userCity}`,
        href: `/?city=${encodeURIComponent(userCity)}`,
        weight: 10,
      });
    }
    pulses.push({
      id: "seed-explore",
      kind: "pulse",
      icon: "\u{1F525}",
      text: "Real takes from real people — see what’s trending",
      href: "/?sort=comments",
      weight: 5,
    });
    pulses.push({
      id: "seed-spill",
      kind: "pulse",
      icon: "\u{1FAD6}",
      text: "Got tea on your block? Spill it",
      href: "/?sort=new",
      weight: 1,
    });
  }

  /* Sort by weight desc, dedupe, cap. */
  const seen = new Set<string>();
  const sorted = pulses
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, limit);

  return sorted;
}

/**
 * Cached entry point. Keyed on (userCity, limit) so different visitors
 * with different cities don't share each other's pulses.
 */
export async function computeLivePulses(
  opts: ComputeLivePulsesOpts = {},
): Promise<LivePulse[]> {
  const key = `livePulses:${(opts.userCity ?? "_none").toLowerCase()}:${opts.limit ?? 5}`;
  const fn = unstable_cache(
    async () => computeLivePulsesUncached(opts),
    [key],
    { revalidate: 60, tags: ["livePulses"] },
  );
  return fn();
}

/** Re-export for routes that prefer the segment-level revalidate hint. */
export const revalidate = 60;
