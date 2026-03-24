import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import GeoProvider from "@/components/GeoProvider";
import GeoFeedEnhancer from "@/components/GeoFeedEnhancer";
import GeoCategoryPill from "@/components/GeoCategoryPill";
import GeoNeighborhoodSpotlight from "@/components/GeoNeighborhoodSpotlight";
import GeoStickyBottomCTA from "@/components/GeoStickyBottomCTA";
import GeoPulseBar from "@/components/GeoPulseBar";
import ListingFeed from "@/components/ListingFeed";
import FallbackImage from "@/components/FallbackImage";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";
import { type CommentFeedItem } from "@/components/CommentsFeed";
import { lookupAddress } from "@/lib/address-lookup";
import { enrichBatch } from "@/lib/enrich-batch";

type SearchParams = { [key: string]: string | string[] | undefined };

function str(v: SearchParams[string]) {
  return typeof v === "string" ? v : undefined;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp          = await searchParams;
  const city        = str(sp.city);
  const listingType = str(sp.type) as "sale" | "rent" | undefined;
  const propertyType = str(sp.propertyType);
  const minPrice    = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice    = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const minBeds     = sp.minBeds  ? Number(sp.minBeds)  : undefined;
  const minBaths    = sp.minBaths ? Number(sp.minBaths) : undefined;
  const minSqft     = sp.minSqft  ? Number(sp.minSqft)  : undefined;
  const maxSqft     = sp.maxSqft  ? Number(sp.maxSqft)  : undefined;
  const sort        = str(sp.sort) ?? "newest";
  const perPage     = 12;

  const searchMode = "city" in sp; // User explicitly opened search (even with empty query)
  const hasFilters = !!(city || listingType || propertyType || minPrice || maxPrice || minBeds || minBaths || minSqft || maxSqft);
  const isDefaultLanding = !hasFilters && sort === "newest" && !searchMode;

  // Community stats + comments feed -- only on default landing
  const [listingCount, commentCount, latestCommentsFeed] = isDefaultLanding
    ? await Promise.all([
        prisma.listing.count({ where: { status: "active" } }),
        prisma.comment.count(),
        prisma.comment.findMany({
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            listing: {
              select: { id: true, address: true, city: true, state: true, price: true, photos: true, listingType: true },
            },
            reactions: true,
          },
        }),
      ])
    : [0, 0, []];

  // Map the prisma result to the CommentFeedItem type
  const commentsFeedData: CommentFeedItem[] = latestCommentsFeed.map((c) => ({
    id: c.id,
    name: c.name,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    reactions: c.reactions.map((r) => ({ type: r.type })),
    listing: {
      id: c.listing.id,
      address: c.listing.address,
      city: c.listing.city,
      state: c.listing.state,
      price: c.listing.price,
      photos: c.listing.photos,
      listingType: c.listing.listingType,
    },
  }));

  // Lat/lng for radius search
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const radiusMiles = sp.radius ? Number(sp.radius) : 25;
  const isGeoSearch = lat !== undefined && lng !== undefined;

  // Auto-sync: fire-and-forget
  if (city) {
    void (async () => {
      try {
        await autoSyncCity(city);
      } catch (e) {
        console.error("[AutoSync] Error:", e);
      }
    })();
  }

  // Detect if this looks like an address search
  const looksLikeAddress = city ? /\d+\s+\w+/.test(city) : false;

  // Build where clause
  const conditions: Prisma.ListingWhereInput[] = [
    { status: { in: ["active", "off_market"] } },
  ];

  if (city && !isGeoSearch) {
    const words = city.split(/[\s,]+/).filter(w => w.length > 1);
    conditions.push({
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
        { address: { contains: city, mode: "insensitive" } },
        ...(words.length >= 2 ? [{
          AND: words.map(word => ({
            address: { contains: word, mode: "insensitive" as const },
          })),
        }] : []),
      ],
    });
  }

  if (listingType) conditions.push({ listingType });
  if (propertyType) conditions.push({ propertyType });
  if (minPrice !== undefined || maxPrice !== undefined) {
    conditions.push({ price: { gte: minPrice, lte: maxPrice } });
  }
  if (minBeds !== undefined) conditions.push({ bedrooms: { gte: minBeds } });
  if (minBaths !== undefined) conditions.push({ bathrooms: { gte: minBaths } });
  if (minSqft !== undefined || maxSqft !== undefined) {
    conditions.push({ sqft: { gte: minSqft, lte: maxSqft } });
  }

  const where: Prisma.ListingWhereInput = { AND: conditions };

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-low")  orderBy = { price: "asc" };
  if (sort === "price-high") orderBy = { price: "desc" };

  const selectFields = {
    id: true, address: true, city: true, state: true, neighborhood: true,
    price: true, listingType: true, propertyType: true, status: true,
    bedrooms: true, bathrooms: true, sqft: true, photos: true,
    agentName: true, createdAt: true, latitude: true, longitude: true,
    source: true,
    _count: { select: { comments: true } },
    comments: {
      take: 1,
      orderBy: { createdAt: "desc" as const },
      select: { name: true, content: true },
    },
  } as const;

  let listings: Awaited<ReturnType<typeof prisma.listing.findMany<{ select: typeof selectFields }>>>;
  let total: number;

  if (sort === "comments") {
    const [expensive, worstDeal, count] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { price: "desc" },
        skip: 0,
        take: perPage,
        select: selectFields,
      }),
      prisma.$queryRaw`
        SELECT id FROM "Listing"
        WHERE sqft IS NOT NULL AND sqft > 0 AND status = 'active'
        ORDER BY (price::float / sqft::float) DESC
        LIMIT ${perPage}
      `.then(async (rows: unknown) => {
        const typedRows = rows as any[];
        const ids = typedRows.map((r: any) => r.id);
        if (ids.length === 0) return [];
        return prisma.listing.findMany({
          where: { id: { in: ids } },
          select: selectFields,
        }).then(results => {
          return results.sort((a, b) => {
            const ratioA = a.sqft ? a.price / a.sqft : 0;
            const ratioB = b.sqft ? b.price / b.sqft : 0;
            return ratioB - ratioA;
          });
        });
      }),
      prisma.listing.count({ where }),
    ]);

    const seen = new Set<string>();
    const interleaved: typeof expensive = [];
    let ei = 0, wi = 0;
    while (interleaved.length < perPage && (ei < expensive.length || wi < worstDeal.length)) {
      if (ei < expensive.length) {
        if (!seen.has(expensive[ei].id)) {
          seen.add(expensive[ei].id);
          interleaved.push(expensive[ei]);
        }
        ei++;
      }
      if (interleaved.length >= perPage) break;
      if (wi < worstDeal.length) {
        if (!seen.has(worstDeal[wi].id)) {
          seen.add(worstDeal[wi].id);
          interleaved.push(worstDeal[wi]);
        }
        wi++;
      }
    }

    listings = interleaved;
    total = count;
  } else {
    [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip: 0,
        take: isGeoSearch ? 200 : perPage,
        select: selectFields,
      }),
      prisma.listing.count({ where }),
    ]);
  }

  // If lat/lng provided, sort by distance and filter to radius
  if (isGeoSearch) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 3959;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const withDistance = listings
      .filter((l) => l.latitude != null && l.longitude != null)
      .map((l) => ({
        ...l,
        distance: haversine(lat!, lng!, l.latitude!, l.longitude!),
      }))
      .filter((l) => l.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    const noCoords = listings.filter((l) => l.latitude == null || l.longitude == null);

    const all = [...withDistance, ...noCoords];
    total = all.length;
    listings = all.slice(0, perPage);
  }

  // If address search returned 0 results, try direct address lookup
  let addressLookupResult: { id: string; address: string; city: string; state: string; status: string } | null = null;
  if (listings.length === 0 && city && looksLikeAddress) {
    try {
      const lookupData = await lookupAddress(city);
      if (lookupData.results.length > 0) {
        const freshResults = await prisma.listing.findMany({
          where: {
            id: { in: lookupData.results.map((r) => r.id) },
          },
          take: perPage,
          select: selectFields,
        });
        if (freshResults.length > 0) {
          listings = freshResults;
          total = freshResults.length;
          addressLookupResult = lookupData.results[0];
        }
      }
    } catch (e) {
      console.error("[AddressLookup] Fallback error:", e);
    }
  }

  // Fire-and-forget: enrich listings with few photos
  const needsEnrich = listings
    .filter((l) => l.photos.length <= 1 && l.source === "realtor")
    .slice(0, 5)
    .map((l) => l.id);
  if (needsEnrich.length > 0) {
    void (async () => {
      try {
        await enrichBatch(needsEnrich);
      } catch (e) {
        console.error("[EnrichBatch] Error:", e);
      }
    })();
  }

  // Map listings to include topComment
  const withComments = listings.map((l) => ({
    ...l,
    topComment: l.comments?.[0] ?? null,
  }));

  const sortedListings = withComments;
  const hasMore = perPage < total;

  // Build search params record for the client component
  const feedParams: Record<string, string> = {};
  if (city) feedParams.city = city;
  if (listingType) feedParams.type = listingType;
  if (propertyType) feedParams.propertyType = propertyType;
  if (minPrice !== undefined) feedParams.minPrice = String(minPrice);
  if (maxPrice !== undefined) feedParams.maxPrice = String(maxPrice);
  if (minBeds !== undefined) feedParams.minBeds = String(minBeds);
  if (minBaths !== undefined) feedParams.minBaths = String(minBaths);
  if (minSqft !== undefined) feedParams.minSqft = String(minSqft);
  if (maxSqft !== undefined) feedParams.maxSqft = String(maxSqft);
  if (sort !== "newest") feedParams.sort = sort;
  if (lat !== undefined) feedParams.lat = String(lat);
  if (lng !== undefined) feedParams.lng = String(lng);
  if (radiusMiles !== 25) feedParams.radius = String(radiusMiles);

  /* ── Build the interleaved feed items for default landing ── */
  type FeedItem =
    | { type: "take"; data: CommentFeedItem }
    | { type: "listing"; data: (typeof sortedListings)[number] }
    | { type: "neighborhood"; data?: undefined }
    | { type: "founder"; data?: undefined }
    | { type: "how-it-works"; data?: undefined };

  const feedItems: FeedItem[] = [];

  if (isDefaultLanding) {
    const takes = [...commentsFeedData];
    const listings_pool = [...sortedListings];
    // Pattern: take, take, neighborhood, listing, take, founder, listing, listing, how-it-works, then remaining
    const pattern: FeedItem["type"][] = [
      "take", "take", "neighborhood", "listing", "take", "founder",
      "listing", "listing", "how-it-works",
    ];

    let takeIdx = 0;
    let listIdx = 0;

    for (const slot of pattern) {
      if (slot === "take" && takeIdx < takes.length) {
        feedItems.push({ type: "take", data: takes[takeIdx++] });
      } else if (slot === "listing" && listIdx < listings_pool.length) {
        feedItems.push({ type: "listing", data: listings_pool[listIdx++] });
      } else if (slot === "neighborhood") {
        feedItems.push({ type: "neighborhood" });
      } else if (slot === "founder") {
        feedItems.push({ type: "founder" });
      } else if (slot === "how-it-works") {
        feedItems.push({ type: "how-it-works" });
      }
    }

    // Append remaining takes and listings interleaved
    while (takeIdx < takes.length || listIdx < listings_pool.length) {
      if (takeIdx < takes.length) {
        feedItems.push({ type: "take", data: takes[takeIdx++] });
      }
      if (takeIdx < takes.length) {
        feedItems.push({ type: "take", data: takes[takeIdx++] });
      }
      if (listIdx < listings_pool.length) {
        feedItems.push({ type: "listing", data: listings_pool[listIdx++] });
      }
    }
  }

  /* ── Helper: format price ── */
  function fmtPrice(price: number, listingType: string) {
    return listingType === "rent"
      ? `$${price.toLocaleString()}/mo`
      : `$${price.toLocaleString()}`;
  }

  /* ── Helper: time ago ── */
  function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  }

  /* ── Category pills — each links to a real filtered view ── */
  const categories = [
    { label: "Trending", emoji: "🔥", href: "/?sort=comments" },
    { label: "New Listings", emoji: "🏠", href: "/?sort=newest" },
    { label: "Buyer Warnings", emoji: "⚠️", href: "/?sort=comments&type=sale" },
    { label: "Best Blocks", emoji: "💚", href: "/?sort=price-high" },
    { label: "Price Drops", emoji: "💰", href: "/?sort=price-low" },
    { label: "For Rent", emoji: "🔑", href: "/?type=rent&sort=newest" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Geolocation context provider — wraps entire page for geo-aware components */}
      <Suspense>
        <GeoProvider>

      {/* ====== DEFAULT LANDING: THE FEED ====== */}
      {isDefaultLanding ? (
        <div className="max-w-xl mx-auto pb-24">
          {/* Auto-enhance feed with geo when location is available */}
          <GeoFeedEnhancer />

          {/* ── TIGHT HEADER BAR ── */}
          <div className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-divider">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-ink tracking-tight">gwak gwak</h1>
                <span className="text-xs text-tertiary font-medium hidden sm:inline">&mdash; real estate, real talk</span>
              </div>
              <a
                href="/?city="
                className="w-9 h-9 rounded-full bg-highlight border border-divider flex items-center justify-center hover:bg-surface hover:border-ink/20 transition-all active:scale-95"
                aria-label="Search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </a>
            </div>

            {/* ── CATEGORY PILLS ── */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none -mx-0">
              <GeoCategoryPill />
              {categories.map((cat) => (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-divider text-sm font-medium text-ink hover:border-amber/40 hover:shadow-soft active:scale-[0.97] transition-all"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="whitespace-nowrap">{cat.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ═══ THE GUT PUNCH — why this exists ═══ */}
          <div className="px-4 pt-6 pb-4">
            {/* The pain — hit them immediately */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-ink leading-[1.15] tracking-tight mb-3">
              The stuff your realtor<br />
              <span className="text-amber">will never tell you.</span>
            </h2>
            <p className="text-[14px] text-secondary leading-relaxed mb-5 max-w-md">
              Every property has a history. Your neighbors know it. Your realtor won&apos;t share it. gwak gwak is where the truth lives.
            </p>

            {/* Real examples — the "oh shit" moment */}
            <div className="space-y-2.5 mb-5">
              {[
                { text: "The basement flooded 3 times. Insurance dropped them.", vibe: "🚨" },
                { text: "Best street in the neighborhood. My kids walk to school every day.", vibe: "💚" },
                { text: "Seller is hiding mold behind the new drywall. I watched them cover it up.", vibe: "⚠️" },
              ].map((ex, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-surface border border-divider rounded-xl px-3.5 py-3">
                  <span className="text-lg shrink-0">{ex.vibe}</span>
                  <p className="text-[13px] text-ink leading-snug font-medium italic">&ldquo;{ex.text}&rdquo;</p>
                </div>
              ))}
              <p className="text-[11px] text-tertiary text-center pt-1">
                Real takes from verified neighbors. Not reviews. Not ratings. <span className="text-ink font-semibold">The truth.</span>
              </p>
            </div>

            {/* The hook — enter your zip */}
            <div className="bg-ink rounded-xl p-4 text-center mb-2">
              <p className="text-[13px] text-white/70 mb-2">What are your neighbors saying about your block?</p>
              <Suspense>
                <SearchBar />
              </Suspense>
            </div>

            {/* Live activity (geo-aware) */}
            <GeoPulseBar commentCount={commentCount} listingCount={listingCount} />
          </div>

          {/* ═══ THE FEED — now that they understand WHY, show them WHAT ═══ */}
          <div className="divide-y divide-divider">
            {feedItems.map((item, idx) => {
              /* ── TAKE CARD ── */
              if (item.type === "take" && item.data) {
                const comment = item.data as CommentFeedItem;
                const photo = comment.listing.photos[0];
                const initials = comment.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                const reactionCounts: Record<string, number> = {};
                for (const r of comment.reactions) {
                  reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
                }
                const totalReactions = comment.reactions.length;

                return (
                  <a key={`take-${comment.id}`} href={`/listing/${comment.listing.id}`} className="block group">
                    {/* Big property photo */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-highlight">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={comment.listing.address}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading={idx < 3 ? "eager" : "lazy"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                      )}
                      {/* Price + location overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10">
                        <p className="text-xl font-extrabold text-white leading-none">{fmtPrice(comment.listing.price, comment.listing.listingType)}</p>
                        <p className="text-sm text-white/80 mt-0.5 truncate">{comment.listing.address}, {comment.listing.city}</p>
                      </div>
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10">
                          {comment.listing.listingType === "rent" ? "Rental" : "For Sale"}
                        </span>
                      </div>
                    </div>

                    {/* Comment hero text */}
                    <div className="px-4 py-4">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber">{initials}</span>
                        </div>
                        <span className="text-sm font-semibold text-ink">{comment.name}</span>
                        <span className="text-[11px] text-tertiary">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-[16px] text-ink leading-relaxed line-clamp-3 mb-3 font-serif italic">
                        &ldquo;{comment.content}&rdquo;
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.entries(reactionCounts).length > 0 ? (
                            Object.entries(reactionCounts).map(([emoji, count]) => (
                              <span key={emoji} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-highlight border border-divider/60 text-ink">
                                <span className="text-sm">{emoji}</span>
                                <span className="font-medium">{count}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-tertiary">Be the first to react</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-amber group-hover:underline shrink-0">
                          {totalReactions > 0 ? `See ${totalReactions} takes` : "Add your take"} &rarr;
                        </span>
                      </div>
                    </div>
                  </a>
                );
              }

              /* ── LISTING CARD (in feed) ── */
              if (item.type === "listing" && item.data) {
                const listing = item.data as (typeof sortedListings)[number];
                const photo = listing.photos[0];
                const commentCount_l = listing._count?.comments ?? 0;

                return (
                  <a key={`listing-${listing.id}`} href={`/listing/${listing.id}`} className="block group">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-highlight">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={listing.address}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10">
                        <p className="text-xl font-extrabold text-white leading-none">{fmtPrice(listing.price, listing.listingType)}</p>
                        <p className="text-sm text-white/80 mt-0.5 truncate">{listing.address}, {listing.city}</p>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10">
                          {listing.listingType === "rent" ? "Rental" : "For Sale"}
                        </span>
                        {listing.status === "active" && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/80 backdrop-blur-sm text-white">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <div className="flex items-center gap-3 text-sm text-secondary mb-2">
                        {listing.bedrooms != null && <span>{listing.bedrooms} bd</span>}
                        {listing.bathrooms != null && <span>{listing.bathrooms} ba</span>}
                        {listing.sqft != null && <span>{listing.sqft.toLocaleString()} sqft</span>}
                        {listing.propertyType && <span className="text-tertiary">{listing.propertyType}</span>}
                      </div>
                      {listing.topComment ? (
                        <p className="text-sm text-ink/80 line-clamp-2 mb-2 italic">
                          &ldquo;{listing.topComment.content}&rdquo; &mdash; <span className="font-medium not-italic">{listing.topComment.name}</span>
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tertiary">
                          {commentCount_l > 0 ? `${commentCount_l} take${commentCount_l !== 1 ? "s" : ""}` : "No takes yet"}
                        </span>
                        <span className="text-xs font-semibold text-amber group-hover:underline">
                          {commentCount_l > 0 ? "Read takes" : "Be the first"} &rarr;
                        </span>
                      </div>
                    </div>
                  </a>
                );
              }

              /* ── NEIGHBORHOOD SPOTLIGHT CARD (geo-aware) ── */
              if (item.type === "neighborhood") {
                return <GeoNeighborhoodSpotlight key="neighborhood" commentCount={commentCount} />;
              }

              /* ── FOUNDER STORY CARD ── */
              if (item.type === "founder") {
                return (
                  <div key="founder" className="px-4 py-5">
                    <div className="rounded-2xl border border-divider bg-gradient-to-br from-surface to-highlight p-5 relative overflow-hidden">
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="relative">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shrink-0">ZK</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-ink">Zachary Kaufman</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber/10 text-amber font-semibold">founder</span>
                            </div>
                            <p className="text-[11px] text-tertiary">3 weeks ago</p>
                          </div>
                        </div>
                        <p className="text-[15px] text-ink/80 leading-relaxed mb-2">
                          &ldquo;I bought my place and my neighbors immediately told me things my realtor never mentioned. Un-permitted additions. Flooding history. Neighbor disputes that went on for years.&rdquo;
                        </p>
                        <p className="text-[15px] text-ink font-semibold leading-relaxed mb-3">
                          &ldquo;If gwak gwak existed, I would have had second thoughts. That&apos;s why I built it.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                          <a href="/about" className="text-xs text-amber font-semibold hover:underline">Read the full story →</a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              /* ── HOW IT WORKS MINI CARD ── */
              if (item.type === "how-it-works") {
                return (
                  <div key="how-it-works" className="px-4 py-5">
                    <div className="rounded-2xl border border-divider bg-surface p-5">
                      <p className="text-[11px] font-bold tracking-widest uppercase text-tertiary mb-3">How it works</p>
                      <div className="flex items-start gap-4">
                        {[
                          { step: "1", emoji: "\uD83C\uDFE0", label: "Browse any neighborhood" },
                          { step: "2", emoji: "\uD83D\uDCAC", label: "Read takes from real neighbors" },
                          { step: "3", emoji: "\uD83D\uDDE3\uFE0F", label: "Verify your zip. Be heard." },
                        ].map((s) => (
                          <div key={s.step} className="flex-1 text-center">
                            <div className="text-2xl mb-1.5">{s.emoji}</div>
                            <p className="text-xs text-ink font-medium leading-tight">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* ── Load more / see all listings ── */}
          {(sortedListings.length > 0 || commentsFeedData.length > 0) && (
            <div className="px-4 py-6">
              <a
                href="/?sort=comments"
                className="block text-center py-3.5 bg-ink text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                See all trending listings &rarr;
              </a>
            </div>
          )}

          {/* ── STICKY BOTTOM CTA (mobile, geo-aware) ── */}
          <GeoStickyBottomCTA />
        </div>
      ) : (
        /* ====== FILTERED / SEARCH VIEW ====== */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="mb-8">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {/* Sort + filter bar */}
          <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {hasFilters && (
                  <p className="text-xs text-tertiary mb-1">
                    {total} result{total !== 1 ? "s" : ""}
                    {city && ` in ${city}`}
                  </p>
                )}
                <h2 className="text-xl font-semibold text-ink">
                  {city ? city : sort === "comments" ? "Trending" : "Explore"}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { key: "newest", label: "New" },
                  { key: "comments", label: "\uD83D\uDD25 Trending" },
                  { key: "price-low", label: "$ Low" },
                  { key: "price-high", label: "$ High" },
                ].map((s) => {
                  const params = new URLSearchParams(
                    Object.fromEntries(
                      Object.entries(sp)
                        .filter(([, v]) => typeof v === "string") as [string, string][]
                    )
                  );
                  params.set("sort", s.key);
                  params.delete("page");
                  const isActive = sort === s.key;
                  return (
                    <a
                      key={s.key}
                      href={`/?${params.toString()}`}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        isActive
                          ? "bg-ink text-bg font-medium"
                          : "text-secondary hover:bg-surface hover:text-ink"
                      }`}
                    >
                      {s.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Listings */}
          {sortedListings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">{"\uD83C\uDFE0"}</div>
              <p className="text-xl font-semibold text-ink mb-2">
                No listings found
              </p>
              <p className="text-sm text-secondary max-w-md mx-auto">
                Try a different search or check out what&apos;s trending.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <a href="/" className="px-4 py-2 rounded-full bg-ink text-bg text-sm font-medium hover:opacity-90 transition-opacity">
                  Browse all
                </a>
                <a href="/?sort=comments" className="px-4 py-2 rounded-full border border-divider text-sm text-secondary hover:text-ink hover:border-ink/40 transition-colors">
                  See trending
                </a>
              </div>
            </div>
          ) : (
            <ListingFeed
              initialListings={sortedListings}
              initialHasMore={hasMore}
              searchParams={feedParams}
              communityMoments={[]}
            />
          )}
        </div>
      )}

        </GeoProvider>
      </Suspense>
    </div>
  );
}
