/**
 * Orchestrates ranked feed sections from a pool of candidate listings.
 *
 * Pure-ish — no Prisma calls here. Callers fetch the candidate pool and the
 * user's interaction history, then hand it off to this module to rank and
 * bucket. That keeps the heavy SQL out of the React tree and lets the
 * ranking logic stay testable.
 */

import {
  combinedScore,
  geoScore,
  type ScoringListing,
} from "@/lib/recommendations";
import { MARKETS, getMarketLabel } from "@/lib/onboarding/markets";

// ── Types ────────────────────────────────────────────────────────────

export type RankerListing = ScoringListing & {
  status?: string | null;
  photos?: string[];
  createdAt?: Date | string | null;
  agentName?: string | null;
  _count?: { comments: number };
  topComment?: { name: string; content: string } | null;
};

export type RankerUser = {
  id?: string | null;
  markets?: string[];
  neighborhoods?: string[];
  /** Listings the user has interacted with (saved / commented / viewed). */
  interactionListings?: ScoringListing[];
};

export type FeedSection = {
  key: string;
  title: string;
  subtitle?: string;
  /** Hint to the UI on how to render — flat grid vs. horizontal carousel. */
  layout: "grid" | "carousel";
  listings: RankerListing[];
};

export type RankedFeed = {
  sections: FeedSection[];
  /** True when the user has no signal at all and we fell back to onboarding hints. */
  isCold: boolean;
};

// ── Market helpers ───────────────────────────────────────────────────

/**
 * Match a market code (e.g. "nyc", "la") against a listing's city / state /
 * zip. We compare against aliases as well so "the city" still finds SF.
 */
function listingMatchesMarket(listing: RankerListing, marketCode: string): boolean {
  const market = MARKETS.find((m) => m.code === marketCode);
  if (!market) return false;

  const haystack = [
    listing.city,
    listing.state,
    listing.neighborhood,
    listing.address,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!haystack) return false;

  // First word of the label is usually the city name; check that
  const primaryCity = market.label.split(",")[0]!.trim().toLowerCase();
  if (haystack.includes(primaryCity)) return true;

  return market.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}

function listingMatchesAnyMarket(listing: RankerListing, codes: string[]): boolean {
  return codes.some((code) => listingMatchesMarket(listing, code));
}

function listingMatchesNeighborhood(
  listing: RankerListing,
  neighborhoods: string[],
): boolean {
  if (!neighborhoods?.length) return false;
  const target = (listing.neighborhood ?? "").trim().toLowerCase();
  if (!target) return false;
  return neighborhoods.some((n) => n.trim().toLowerCase() === target);
}

// ── Date helpers ─────────────────────────────────────────────────────

function ageInDays(value: Date | string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const t = typeof value === "string" ? Date.parse(value) : value.getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

// ── Section builders ─────────────────────────────────────────────────

const NEAR_LIMIT = 12;
const TRENDING_LIMIT = 8;
const FRESH_LIMIT = 8;
const PICKED_LIMIT = 8;

function dedupeOrdered<T extends { id: string }>(arrs: T[][]): Set<string> {
  const seen = new Set<string>();
  for (const arr of arrs) for (const item of arr) seen.add(item.id);
  return seen;
}

function nearYouSection(
  user: RankerUser,
  listings: RankerListing[],
): FeedSection | null {
  if (!user.markets?.length && !user.neighborhoods?.length) return null;

  const codes = user.markets ?? [];
  const matches = listings
    .filter(
      (l) =>
        listingMatchesAnyMarket(l, codes) ||
        listingMatchesNeighborhood(l, user.neighborhoods ?? []),
    )
    .slice(0, NEAR_LIMIT);

  if (matches.length === 0) return null;

  const primaryLabel = codes[0] ? getMarketLabel(codes[0]) : "your area";
  return {
    key: "near-you",
    title: "Near you",
    subtitle: `Fresh from ${primaryLabel}`,
    layout: "grid",
    listings: matches,
  };
}

function trendingSection(
  user: RankerUser,
  listings: RankerListing[],
): FeedSection | null {
  const primary = user.markets?.[0];
  if (!primary) return null;

  const cutoffDays = 14;
  const candidates = listings.filter(
    (l) =>
      listingMatchesMarket(l, primary) &&
      (l._count?.comments ?? 0) > 0 &&
      ageInDays(l.createdAt) <= 60, // listing itself isn't too stale
  );

  // Approximate "commented in last 14 days" by combining comment count with
  // listing recency — we don't have per-comment timestamps in the pool.
  const ranked = candidates
    .map((l) => ({
      l,
      heat:
        (l._count?.comments ?? 0) *
        (ageInDays(l.createdAt) <= cutoffDays ? 1.5 : 1),
    }))
    .sort((a, b) => b.heat - a.heat)
    .slice(0, TRENDING_LIMIT)
    .map((x) => x.l);

  if (ranked.length === 0) return null;

  return {
    key: "trending",
    title: `Trending in ${getMarketLabel(primary).split(",")[0]}`,
    subtitle: "Where the takes are landing",
    layout: "carousel",
    listings: ranked,
  };
}

function pickedForYouSection(
  user: RankerUser,
  listings: RankerListing[],
  excluded: Set<string>,
): FeedSection | null {
  const history = user.interactionListings ?? [];
  if (history.length === 0) return null;

  // Score every candidate against the user's interaction set and keep the max.
  const scored: Array<{ l: RankerListing; score: number }> = [];
  for (const l of listings) {
    if (excluded.has(l.id)) continue;
    let best = 0;
    for (const h of history) {
      if (h.id === l.id) continue;
      const s = combinedScore(h, l);
      if (s > best) best = s;
    }
    if (best > 0) scored.push({ l, score: best });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, PICKED_LIMIT).map((x) => x.l);
  if (top.length === 0) return null;

  return {
    key: "picked-for-you",
    title: "Picked for you",
    subtitle: "Because of listings you've explored",
    layout: "grid",
    listings: top,
  };
}

function freshSection(
  user: RankerUser,
  listings: RankerListing[],
  excluded: Set<string>,
): FeedSection | null {
  const codes = user.markets ?? [];
  if (!codes.length) return null;

  const fresh = listings
    .filter(
      (l) => !excluded.has(l.id) && listingMatchesAnyMarket(l, codes),
    )
    .map((l) => ({ l, age: ageInDays(l.createdAt) }))
    .filter((x) => Number.isFinite(x.age))
    .sort((a, b) => a.age - b.age)
    .slice(0, FRESH_LIMIT)
    .map((x) => x.l);

  if (fresh.length === 0) return null;

  return {
    key: "fresh",
    title: "Fresh on the block",
    subtitle: "Just listed in your markets",
    layout: "grid",
    listings: fresh,
  };
}

function popularMarketsFallback(listings: RankerListing[]): FeedSection {
  // Pick listings spread across the top 3 markets by hits in the pool.
  const top3 = MARKETS.slice(0, 3).map((m) => m.code);
  const grouped: Record<string, RankerListing[]> = {};
  for (const code of top3) grouped[code] = [];

  for (const l of listings) {
    for (const code of top3) {
      if (listingMatchesMarket(l, code) && grouped[code]!.length < 4) {
        grouped[code]!.push(l);
        break;
      }
    }
  }

  const mixed: RankerListing[] = [];
  for (let i = 0; i < 4; i++) {
    for (const code of top3) {
      const slot = grouped[code]!;
      if (slot[i]) mixed.push(slot[i]!);
    }
  }

  // If we got nothing market-tagged, just hand back the most-commented few.
  const fallback =
    mixed.length > 0
      ? mixed
      : [...listings]
          .sort(
            (a, b) => (b._count?.comments ?? 0) - (a._count?.comments ?? 0),
          )
          .slice(0, 12);

  return {
    key: "popular-markets",
    title: "Browse popular markets",
    subtitle: "Set up your feed for what's actually near you",
    layout: "grid",
    listings: fallback,
  };
}

// ── Public API ───────────────────────────────────────────────────────

export function rankFeedForUser(opts: {
  user: RankerUser | null | undefined;
  listings: RankerListing[];
  /** Approximate maximum total cards across all sections. */
  limit?: number;
}): RankedFeed {
  const { user, listings } = opts;
  const limit = opts.limit ?? 60;

  const hasMarkets = (user?.markets?.length ?? 0) > 0;

  // Cold-start
  if (!user || !hasMarkets) {
    return {
      sections: [popularMarketsFallback(listings)],
      isCold: true,
    };
  }

  const sections: FeedSection[] = [];

  const near = nearYouSection(user, listings);
  if (near) sections.push(near);

  const excluded = dedupeOrdered(sections.map((s) => s.listings));

  const trending = trendingSection(user, listings);
  if (trending) {
    // Trending can overlap with Near you on purpose (different framing) —
    // but don't repeat the exact same first card right above.
    trending.listings = trending.listings.filter((l) => !excluded.has(l.id));
    if (trending.listings.length > 0) sections.push(trending);
  }

  const afterTrending = dedupeOrdered(sections.map((s) => s.listings));

  const picked = pickedForYouSection(user, listings, afterTrending);
  if (picked) sections.push(picked);

  const afterPicked = dedupeOrdered(sections.map((s) => s.listings));

  const fresh = freshSection(user, listings, afterPicked);
  if (fresh) sections.push(fresh);

  // Trim to roughly `limit` cards total.
  let running = 0;
  for (const s of sections) {
    if (running >= limit) {
      s.listings = [];
      continue;
    }
    const remaining = limit - running;
    if (s.listings.length > remaining) {
      s.listings = s.listings.slice(0, remaining);
    }
    running += s.listings.length;
  }

  const populated = sections.filter((s) => s.listings.length > 0);

  // Last-resort: if all sections are empty (user has markets but pool has
  // nothing matching) fall back to the cold-start view.
  if (populated.length === 0) {
    return {
      sections: [popularMarketsFallback(listings)],
      isCold: true,
    };
  }

  return { sections: populated, isCold: false };
}

/**
 * Top N listings most similar to `listing` from the candidate pool, by
 * `combinedScore`. Used by "More like this" on listing detail pages.
 */
export function getSimilarListings(
  listing: ScoringListing,
  candidatePool: RankerListing[],
  n = 6,
): RankerListing[] {
  const scored: Array<{ l: RankerListing; score: number }> = [];
  for (const c of candidatePool) {
    if (c.id === listing.id) continue;
    // Same-market gate: at minimum the listings should be geographically
    // related, otherwise "similar" loses meaning.
    const g = geoScore(listing, c);
    if (g === 0) continue;
    const score = combinedScore(listing, c);
    if (score > 0) scored.push({ l: c, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((x) => x.l);
}
