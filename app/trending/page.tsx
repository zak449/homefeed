import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TrendingTabs from "./TrendingTabs";

export const metadata: Metadata = {
  title: "Trending Conversations — Gwaky",
  description:
    "See which listings people are talking about the most. Real opinions on real estate.",
};

export default async function TrendingPage() {
  // ── Tab 1: Most Discussed — listings sorted by comment count ──
  const mostDiscussed = await prisma.listing.findMany({
    where: { status: "active", comments: { some: {} } },
    orderBy: { comments: { _count: "desc" } },
    take: 20,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      propertyType: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      photos: true,
      _count: { select: { comments: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
          reactions: { select: { type: true } },
        },
      },
    },
  });

  // ── Tab 2: Hottest Takes — individual comments with most reactions ──
  const hottestComments = await prisma.comment.findMany({
    where: { reactions: { some: {} } },
    orderBy: { reactions: { _count: "desc" } },
    take: 20,
    select: {
      id: true,
      name: true,
      content: true,
      createdAt: true,
      _count: { select: { reactions: true } },
      reactions: { select: { type: true } },
      listing: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          propertyType: true,
          bedrooms: true,
          bathrooms: true,
          sqft: true,
          photos: true,
        },
      },
    },
  });

  // ── Tab 3: Most Active Neighborhoods — cities ranked by comment volume ──
  const cityCommentCounts = await prisma.comment.groupBy({
    by: ["listingId"],
    _count: { id: true },
  });

  // Resolve listingId -> city mapping
  const allListingIds = cityCommentCounts.map((c) => c.listingId);
  const listingsForCities =
    allListingIds.length > 0
      ? await prisma.listing.findMany({
          where: { id: { in: allListingIds }, status: "active" },
          select: {
            id: true,
            city: true,
            state: true,
            photos: true,
          },
        })
      : [];

  const listingMap = new Map(listingsForCities.map((l) => [l.id, l]));
  const cityAgg: Record<
    string,
    { city: string; state: string; commentCount: number; photos: string[] }
  > = {};

  for (const row of cityCommentCounts) {
    const listing = listingMap.get(row.listingId);
    if (!listing) continue;
    const key = `${listing.city}|${listing.state}`;
    if (!cityAgg[key]) {
      cityAgg[key] = {
        city: listing.city,
        state: listing.state,
        commentCount: 0,
        photos: [],
      };
    }
    cityAgg[key].commentCount += row._count.id;
    if (cityAgg[key].photos.length < 4) {
      for (const p of listing.photos) {
        if (cityAgg[key].photos.length < 4 && !cityAgg[key].photos.includes(p)) {
          cityAgg[key].photos.push(p);
        }
      }
    }
  }

  const cityListingCounts = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: { status: "active" },
    _count: { id: true },
  });
  const cityListingMap = new Map(
    cityListingCounts.map((c) => [`${c.city}|${c.state}`, c._count.id])
  );

  const sortedCities = Object.values(cityAgg)
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 15)
    .map((c) => ({
      ...c,
      listingCount: cityListingMap.get(`${c.city}|${c.state}`) ?? 0,
    }));

  // ── Aggregate stats for hero ──
  const totalComments = await prisma.comment.count();
  const activeListingCount = mostDiscussed.length;

  // ── Normalize for client ──
  const discussedTab = mostDiscussed.map((l) => ({
    id: l.id,
    address: l.address,
    city: l.city,
    state: l.state,
    price: l.price,
    listingType: l.listingType,
    propertyType: l.propertyType,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    sqft: l.sqft,
    photo: l.photos[0] ?? null,
    photos: l.photos.slice(0, 3),
    commentCount: l._count.comments,
    comments: l.comments.map((c) => ({
      id: c.id,
      name: c.name,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      reactions: c.reactions.map((r) => r.type),
    })),
  }));

  const hottestTab = hottestComments.map((c) => ({
    commentId: c.id,
    name: c.name,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    reactionCount: c._count.reactions,
    reactions: c.reactions.map((r) => r.type),
    listing: {
      id: c.listing.id,
      address: c.listing.address,
      city: c.listing.city,
      state: c.listing.state,
      price: c.listing.price,
      listingType: c.listing.listingType,
      propertyType: c.listing.propertyType,
      bedrooms: c.listing.bedrooms,
      bathrooms: c.listing.bathrooms,
      sqft: c.listing.sqft,
      photo: c.listing.photos[0] ?? null,
    },
  }));

  const neighborhoodsTab = sortedCities;

  const isEmpty =
    discussedTab.length === 0 &&
    hottestTab.length === 0 &&
    neighborhoodsTab.length === 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary hover:text-ink transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Gwaky
        </Link>

        {/* Hero header */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-[#111111] px-6 py-8 sm:px-8 sm:py-10">
          {/* Background glow orbs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber/20 blur-3xl amber-shimmer pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber/10 blur-3xl glow-pulse pointer-events-none" />

          <div className="relative z-10">
            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <p className="text-[11px] font-bold tracking-widest uppercase text-green-400">
                Live now
              </p>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tighter leading-[1.08] mb-2">
              The hottest takes
            </h1>
            <p className="text-[15px] text-white/60 leading-relaxed max-w-md">
              Real people, real opinions. See what everyone&rsquo;s arguing about right now.
            </p>

            {/* Animated stats */}
            {!isEmpty && (
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-white font-display tracking-tight leading-none">
                      {totalComments.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-white/40 font-medium">takes dropped</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-white font-display tracking-tight leading-none">
                      {activeListingCount}
                    </p>
                    <p className="text-[11px] text-white/40 font-medium">active listings</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isEmpty ? (
          <EmptyStateHero />
        ) : (
          <TrendingTabs
            discussed={discussedTab}
            hottest={hottestTab}
            neighborhoods={neighborhoodsTab}
          />
        )}
      </div>
    </div>
  );
}

function EmptyStateHero() {
  return (
    <div className="relative bg-surface rounded-2xl border border-divider overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      <div className="relative px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <h2 className="font-display text-2xl font-extrabold text-ink tracking-tight mb-3">
          Be the first voice
        </h2>
        <p className="text-[15px] text-secondary leading-relaxed max-w-sm mx-auto mb-8">
          No one&rsquo;s started talking yet. Search any listing and drop your take to kick things off.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 bg-[#F5F5F5] text-[#0E0E0E] text-sm font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all shadow-elevated"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search listings
        </Link>
      </div>
    </div>
  );
}
