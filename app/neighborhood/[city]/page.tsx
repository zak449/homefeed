import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingFeed from "@/components/ListingFeed";
import FallbackImage from "@/components/FallbackImage";

const REACTIONS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDC80"];

function getVibe(reactionTotal: number, commentCount: number): { label: string; color: string } {
  if (commentCount === 0) return { label: "No opinions yet", color: "text-muted" };
  const ratio = reactionTotal / Math.max(commentCount, 1);
  if (ratio >= 3) return { label: "People love it here", color: "text-emerald-600" };
  if (ratio >= 1) return { label: "Mixed feelings", color: "text-amber-600" };
  return { label: "Controversial", color: "text-rose-600" };
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityDecoded = decodeURIComponent(city);
  return {
    title: `${cityDecoded} \u2014 What People Really Think \u00b7 homefeed`,
    description: `See what neighbors, agents, and locals are saying about homes in ${cityDecoded}. Real opinions, real reactions.`,
  };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityDecoded = decodeURIComponent(city);

  // Check if this city has any listings
  const totalListings = await prisma.listing.count({
    where: { city: { equals: cityDecoded, mode: "insensitive" }, status: "active" },
  });

  if (totalListings === 0) notFound();

  // Fetch all stats in parallel
  const [
    priceStats,
    commentCount,
    reactionCounts,
    topDiscussed,
    latestComments,
    listings,
  ] = await Promise.all([
    // Price stats
    prisma.listing.aggregate({
      where: { city: { equals: cityDecoded, mode: "insensitive" }, status: "active" },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
    }),
    // Total comments in this city
    prisma.comment.count({
      where: { listing: { city: { equals: cityDecoded, mode: "insensitive" } } },
    }),
    // Reaction counts by type
    prisma.reaction.groupBy({
      by: ["type"],
      where: { comment: { listing: { city: { equals: cityDecoded, mode: "insensitive" } } } },
      _count: true,
    }),
    // Top 3 most-discussed listings
    prisma.listing.findMany({
      where: {
        city: { equals: cityDecoded, mode: "insensitive" },
        status: "active",
        comments: { some: {} },
      },
      orderBy: { comments: { _count: "desc" } },
      take: 3,
      select: {
        id: true, address: true, city: true, state: true, price: true,
        listingType: true, photos: true, bedrooms: true, bathrooms: true, sqft: true,
        _count: { select: { comments: true } },
        comments: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { name: true, content: true },
        },
      },
    }),
    // Latest comments from this city
    prisma.comment.findMany({
      where: { listing: { city: { equals: cityDecoded, mode: "insensitive" } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        listing: {
          select: { id: true, address: true, price: true, listingType: true },
        },
      },
    }),
    // All active listings for the feed
    prisma.listing.findMany({
      where: { city: { equals: cityDecoded, mode: "insensitive" }, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true, address: true, city: true, state: true, neighborhood: true,
        price: true, listingType: true, propertyType: true, status: true,
        bedrooms: true, bathrooms: true, sqft: true, photos: true,
        agentName: true, createdAt: true, latitude: true, longitude: true,
        _count: { select: { comments: true } },
        comments: {
          take: 1,
          orderBy: { createdAt: "desc" as const },
          select: { name: true, content: true },
        },
      },
    }),
  ]);

  const avgPrice = Math.round(priceStats._avg.price ?? 0);
  const minPrice = priceStats._min.price ?? 0;
  const maxPrice = priceStats._max.price ?? 0;

  // Build reaction map
  const reactionMap: Record<string, number> = {};
  let totalReactions = 0;
  for (const r of reactionCounts) {
    reactionMap[r.type] = r._count;
    totalReactions += r._count;
  }

  const vibe = getVibe(totalReactions, commentCount);

  // Find the top reaction
  let topReaction = "";
  let topReactionCount = 0;
  for (const [emoji, count] of Object.entries(reactionMap)) {
    if (count > topReactionCount) {
      topReaction = emoji;
      topReactionCount = count;
    }
  }

  // Get the city's state from the first listing
  const firstListing = listings[0];
  const state = firstListing?.state ?? "";

  // Map listings with topComment
  const withComments = listings.map((l) => ({
    ...l,
    topComment: l.comments?.[0] ?? null,
  }));

  const hasMore = totalListings > 12;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-6">
        <Link href="/" className="hover:text-ink transition-colors">homefeed</Link>
        <span>/</span>
        <span className="text-ink font-medium">{cityDecoded}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 sm:mb-12">
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tighter leading-[1.1]">
          {cityDecoded}
          {state && <span className="text-muted font-normal text-2xl sm:text-3xl ml-2">{state}</span>}
        </h1>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
          <div className="flex items-center gap-2 bg-tag px-3 py-1.5 rounded-full">
            <span className="text-[13px] font-semibold text-ink">
              {totalListings} listing{totalListings !== 1 ? "s" : ""}
            </span>
          </div>
          {commentCount > 0 && (
            <div className="flex items-center gap-2 bg-social-light border border-social/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-social live-dot" />
              <span className="text-[13px] font-semibold text-social">
                {commentCount} opinion{commentCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <span className="text-sm text-muted">
            Avg <span className="font-semibold text-ink">${avgPrice.toLocaleString()}</span>
          </span>
          <span className="text-[12px] text-muted">
            ${minPrice.toLocaleString()} &ndash; ${maxPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Community Sentiment */}
      {commentCount > 0 && (
        <div className="mb-8 bg-white border border-border rounded-xl p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-ink mb-4">Community Sentiment</h2>

          {/* Vibe indicator */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm font-semibold ${vibe.color}`}>{vibe.label}</span>
            {topReaction && (
              <span className="text-sm text-muted">
                Top reaction: <span className="text-lg">{topReaction}</span>
              </span>
            )}
          </div>

          {/* Reaction breakdown */}
          <div className="flex flex-wrap gap-2">
            {REACTIONS.map((emoji) => {
              const count = reactionMap[emoji] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={emoji}
                  className="flex items-center gap-1.5 bg-tag px-3 py-1.5 rounded-full"
                >
                  <span className="text-base">{emoji}</span>
                  <span className="text-[13px] font-semibold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 3 Most-Discussed */}
      {topDiscussed.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-base font-bold text-ink">
              Most Discussed
            </h2>
            <span className="text-[11px] font-semibold text-social bg-social-light px-2 py-0.5 rounded-full">
              Hot
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topDiscussed.map((t) => {
              const photo = t.photos[0];
              const isRent = t.listingType === "rent";
              const tPrice = isRent
                ? `$${t.price.toLocaleString()}/mo`
                : `$${t.price.toLocaleString()}`;
              const latestComment = t.comments[0];
              return (
                <Link
                  key={t.id}
                  href={`/listing/${t.id}`}
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex gap-3 p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-tag shrink-0">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={t.address}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted/20">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{tPrice}</p>
                      <p className="text-[12px] text-muted truncate">{t.address}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-social bg-social-light px-1.5 py-0.5 rounded">
                        {"\uD83D\uDCAC"} {t._count.comments} comment{t._count.comments !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {latestComment && (
                    <div className="px-4 pb-3 -mt-1">
                      <div className="bg-tag rounded-lg px-3 py-2">
                        <p className="text-[12px] text-muted line-clamp-2">
                          <span className="font-semibold text-ink">{latestComment.name}</span>{" "}
                          {latestComment.content}
                        </p>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Comments */}
      {latestComments.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-bold text-ink mb-4">Latest Opinions</h2>
          <div className="space-y-2">
            {latestComments.map((c) => {
              const isRent = c.listing.listingType === "rent";
              const cPrice = isRent
                ? `$${c.listing.price.toLocaleString()}/mo`
                : `$${c.listing.price.toLocaleString()}`;
              return (
                <Link
                  key={c.id}
                  href={`/listing/${c.listing.id}`}
                  className="block bg-white border border-border rounded-xl px-4 py-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                      {c.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-ink">{c.name}</span>
                        <span className="text-xs text-muted/50">{timeAgo(String(c.createdAt))}</span>
                      </div>
                      <p className="text-sm text-ink/80 mt-0.5 line-clamp-2">{c.content}</p>
                      <p className="text-[11px] text-muted mt-1">
                        on {cPrice} &middot; {c.listing.address}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mb-8 bg-gradient-to-r from-social-light to-[#FFF1E6] border border-social/15 rounded-xl p-5 sm:p-6 text-center">
        <p className="font-display text-lg sm:text-xl font-bold text-ink mb-1">
          What do YOU think about {cityDecoded}?
        </p>
        <p className="text-sm text-muted mb-4">
          Click any listing below to share your opinion and join the conversation.
        </p>
        <Link
          href={`/?city=${encodeURIComponent(cityDecoded)}`}
          className="inline-block px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink/90 transition-colors"
        >
          Browse all listings
        </Link>
      </div>

      {/* Listing Feed */}
      <div>
        <h2 className="font-display text-lg font-bold text-ink mb-4">
          All Listings in {cityDecoded}
        </h2>
        <ListingFeed
          initialListings={withComments}
          initialHasMore={hasMore}
          searchParams={{ city: cityDecoded }}
        />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}
