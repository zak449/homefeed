import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TrendingTabs from "./TrendingTabs";

export const metadata: Metadata = {
  title: "Trending Conversations — gwakgwak",
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
    // Collect up to 4 unique photos for the collage
    if (cityAgg[key].photos.length < 4) {
      for (const p of listing.photos) {
        if (cityAgg[key].photos.length < 4 && !cityAgg[key].photos.includes(p)) {
          cityAgg[key].photos.push(p);
        }
      }
    }
  }

  // Also get listing count per city
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
          Back to gwakgwak
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <p className="text-[11px] font-bold tracking-widest uppercase text-green-600">
              Live
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tighter leading-[1.08]">
            Trending{" "}
            <span className="text-amber">Conversations</span>
          </h1>
          <p className="text-base text-secondary mt-3 leading-relaxed max-w-lg">
            The listings people can&rsquo;t stop talking about. Real-time
            leaderboard of the hottest discussions on gwak gwak.
          </p>
        </div>

        <TrendingTabs
          discussed={discussedTab}
          hottest={hottestTab}
          neighborhoods={neighborhoodsTab}
        />
      </div>
    </div>
  );
}
