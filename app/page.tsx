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
import SplitMapLayout from "@/components/SplitMapLayout";
import VoteButtons from "@/components/VoteButtons";

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

  // Auto-sync: AWAIT with timeout so first searches return results
  if (city) {
    try {
      await Promise.race([
        autoSyncCity(city),
        new Promise((resolve) => setTimeout(resolve, 12000)), // 12s timeout
      ]);
    } catch (e) {
      console.error("[AutoSync] Error:", e);
    }
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
        // Exact full-string matches
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
        { address: { contains: city, mode: "insensitive" } },
        // Word-by-word address match (for multi-word queries)
        ...(words.length >= 2 ? [{
          AND: words.map(word => ({
            address: { contains: word, mode: "insensitive" as const },
          })),
        }] : []),
        // Word-by-word city match (e.g. "santa ana" matches city "Santa Ana")
        ...(words.length >= 2 ? [{
          AND: words.map(word => ({
            OR: [
              { city: { contains: word, mode: "insensitive" as const } },
              { neighborhood: { contains: word, mode: "insensitive" as const } },
            ],
          })),
        }] : []),
        // Individual word matches on city (catches partial city names)
        ...words.filter(w => w.length > 2).map(word => ({
          city: { contains: word, mode: "insensitive" as const },
        })),
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

  // Deduplicate listings (word-match OR queries can return duplicates)
  const seenIds = new Set<string>();
  const uniqueListings = listings.filter((l) => {
    if (seenIds.has(l.id)) return false;
    seenIds.add(l.id);
    return true;
  });

  // Map listings to include topComment
  const withComments = uniqueListings.map((l) => ({
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
        <div className="pb-24">
          {/* Auto-enhance feed with geo when location is available */}
          <GeoFeedEnhancer />

          {/* ═══ HERO — LIFESTYLE IMAGE + OVERLAY ═══ */}
          <div className="relative overflow-hidden bg-ink">
            {/* Lifestyle background image */}
            <div className="absolute inset-0">
              <img
                src="/images/hero-lifestyle.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/95" />
            </div>

            <div className="relative max-w-2xl mx-auto px-5 pt-14 pb-12 sm:pt-20 sm:pb-16">
              {/* Wordmark */}
              <div className="flex items-center gap-3 mb-10 sm:mb-14">
                <h1 className="text-xl font-extrabold text-white tracking-tight font-display">Gwak<span className="text-amber">y</span></h1>
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] text-white/40 font-medium tracking-wide uppercase">Real estate, real talk</span>
              </div>

              {/* Display headline */}
              <h2 className="text-[clamp(2.2rem,6vw,3.5rem)] font-extrabold text-white leading-[1.05] tracking-tight font-display mb-6">
                The stuff your realtor<br />
                <span className="text-amber">will never tell you.</span>
              </h2>

              <p className="text-[16px] sm:text-[18px] text-white/50 leading-relaxed max-w-lg mb-10">
                Every property has a history. Your neighbors know it. Your realtor won&apos;t share it. This is where the truth lives.
              </p>

              {/* ── SEARCH BAR — hero focal point ── */}
              <div className="mb-10">
                <Suspense>
                  <SearchBar />
                </Suspense>
              </div>

              {/* ── SOCIAL PROOF BAR ── */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white/90 tabular-nums">{listingCount.toLocaleString()}</span>
                  <span className="text-sm text-white/40">listings</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/90 tabular-nums">{commentCount.toLocaleString()}</span>
                  <span className="text-sm text-white/40">neighbor takes</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span className="text-sm text-white/40">Any city in the US</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ EXAMPLE QUOTES — social-media style cards ═══ */}
          <div className="max-w-2xl mx-auto px-5 -mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
              {[
                { text: "The basement flooded 3 times. Insurance dropped them.", name: "Mike R.", location: "Denver, CO", time: "2h ago", avatar: "MR", hearts: 47, fires: 12 },
                { text: "Best street in the neighborhood. My kids walk to school every day.", name: "Sarah L.", location: "Austin, TX", time: "5h ago", avatar: "SL", hearts: 83, fires: 0 },
                { text: "Seller is hiding mold behind the new drywall. I watched them cover it up.", name: "James T.", location: "Miami, FL", time: "1h ago", avatar: "JT", hearts: 29, fires: 64 },
              ].map((ex, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-divider p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col">
                  {/* Author row */}
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-9 h-9 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-soft">{ex.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-ink leading-tight">{ex.name}</p>
                      <div className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-tertiary shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="text-[11px] text-tertiary truncate">{ex.location}</span>
                        <span className="text-[11px] text-tertiary/60">·</span>
                        <span className="text-[11px] text-tertiary/60">{ex.time}</span>
                      </div>
                    </div>
                  </div>
                  {/* Quote */}
                  <p className="text-[14px] text-ink leading-snug font-medium flex-1 mb-4">
                    &ldquo;{ex.text}&rdquo;
                  </p>
                  {/* Reactions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-divider">
                    {ex.hearts > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-secondary">
                        <span>&#x2764;&#xFE0F;</span>
                        <span className="font-medium tabular-nums">{ex.hearts}</span>
                      </span>
                    )}
                    {ex.fires > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-secondary">
                        <span>&#x1F525;</span>
                        <span className="font-medium tabular-nums">{ex.fires}</span>
                      </span>
                    )}
                    <span className="ml-auto text-[11px] text-amber font-semibold">Read more &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-tertiary text-center pb-2">
              Real takes from verified neighbors. Not reviews. Not ratings. <span className="text-ink font-semibold">The truth.</span>
            </p>
          </div>

          {/* ═══ CATEGORY PILLS — tactile, visual ═══ */}
          <div className="max-w-2xl mx-auto px-5 py-6">
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              <GeoCategoryPill />
              {categories.map((cat) => (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface border border-divider text-sm font-semibold text-ink shadow-card hover:shadow-card-hover hover:border-amber/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="whitespace-nowrap">{cat.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Geo pulse — live activity */}
          <div className="max-w-2xl mx-auto px-5 pb-4">
            <GeoPulseBar commentCount={commentCount} listingCount={listingCount} />
          </div>

          {/* ═══ THE FEED ═══ */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-5 px-5">
              {feedItems.map((item, idx) => {
                /* ── TAKE CARD (social-feed style) ── */
                if (item.type === "take" && item.data) {
                  const comment = item.data as CommentFeedItem;
                  const photo = comment.listing.photos[0];
                  const initials = comment.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                  const reactionCounts: Record<string, number> = {};
                  for (const r of comment.reactions) {
                    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
                  }
                  const totalReactions = comment.reactions.length;
                  const isHotTake = totalReactions >= 5;

                  return (
                    <div key={`take-${comment.id}`} className="rounded-2xl bg-surface border border-divider shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                      {/* Author row — like a tweet header */}
                      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                        <div className="w-11 h-11 rounded-full bg-amber/10 border-2 border-amber/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-bold text-ink">{comment.name}</span>
                            {isHotTake && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                <span>&#x1F525;</span> Hot Take
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-tertiary">{timeAgo(comment.createdAt)}</span>
                            <span className="text-tertiary/40">·</span>
                            <span className="text-[12px] text-tertiary truncate">{comment.listing.city}, {comment.listing.state}</span>
                          </div>
                        </div>
                        {/* Upvote/downvote */}
                        <VoteButtons />
                      </div>

                      {/* THE TAKE — big, dominant quote */}
                      <div className="px-5 pb-4">
                        <p className="text-[16px] sm:text-[18px] text-ink leading-relaxed font-medium">
                          &ldquo;{comment.content}&rdquo;
                        </p>
                      </div>

                      {/* Property context — smaller, contextual */}
                      <a href={`/listing/${comment.listing.id}`} className="block group/listing">
                        <div className="relative w-full aspect-[2.5/1] overflow-hidden bg-highlight mx-5 mb-4 rounded-xl">
                          {photo ? (
                            <FallbackImage
                              src={photo}
                              alt={comment.listing.address}
                              className="w-full h-full object-cover group-hover/listing:scale-[1.03] transition-transform duration-700"
                              loading={idx < 3 ? "eager" : "lazy"}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-3 pt-10">
                            <p className="text-lg font-extrabold text-white leading-none tracking-tight">{fmtPrice(comment.listing.price, comment.listing.listingType)}</p>
                            <p className="text-xs text-white/70 mt-0.5 truncate">{comment.listing.address}, {comment.listing.city}</p>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                              {comment.listing.listingType === "rent" ? "Rental" : "For Sale"}
                            </span>
                          </div>
                        </div>
                      </a>

                      {/* Reactions + Reply CTA */}
                      <div className="flex items-center justify-between px-5 pb-4 pt-1 border-t border-divider mx-5 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(reactionCounts).length > 0 ? (
                            Object.entries(reactionCounts).map(([emoji, count]) => (
                              <span key={emoji} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-highlight border border-divider/60 text-ink font-medium">
                                <span className="text-sm">{emoji}</span>
                                <span className="tabular-nums">{count}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-tertiary">Be the first to react</span>
                          )}
                        </div>
                        <a
                          href={`/listing/${comment.listing.id}#comment-form`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber hover:underline shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          Reply to this take
                        </a>
                      </div>
                    </div>
                  );
                }

                /* ── LISTING CARD (in feed) — top comment is the main content ── */
                if (item.type === "listing" && item.data) {
                  const listing = item.data as (typeof sortedListings)[number];
                  const photo = listing.photos[0];
                  const commentCount_l = listing._count?.comments ?? 0;

                  return (
                    <a key={`listing-${listing.id}`} href={`/listing/${listing.id}`} className="block group rounded-2xl bg-surface border border-divider shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                      {/* Photo — context, not the star */}
                      <div className="relative w-full aspect-[2.2/1] overflow-hidden bg-highlight">
                        {photo ? (
                          <FallbackImage
                            src={photo}
                            alt={listing.address}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-3 pt-12">
                          <p className="text-xl font-extrabold text-white leading-none tracking-tight">{fmtPrice(listing.price, listing.listingType)}</p>
                          <p className="text-xs text-white/70 mt-1 truncate">{listing.address}, {listing.city}</p>
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                            {listing.listingType === "rent" ? "Rental" : "For Sale"}
                          </span>
                          {listing.status === "active" && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/80 backdrop-blur-md text-white">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top comment — PROMINENT, the main content */}
                      <div className="p-5">
                        {listing.topComment ? (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-amber">
                                  {listing.topComment.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-ink">{listing.topComment.name}</span>
                              <span className="text-[11px] text-tertiary">says:</span>
                            </div>
                            <p className="text-[16px] sm:text-[17px] text-ink leading-relaxed font-medium">
                              &ldquo;{listing.topComment.content}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <p className="text-[15px] text-tertiary italic mb-4">No takes yet — be the first to share what you know.</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-secondary mb-3 pb-3 border-b border-divider">
                          {listing.bedrooms != null && <span className="font-medium">{listing.bedrooms} bd</span>}
                          {listing.bathrooms != null && <span className="font-medium">{listing.bathrooms} ba</span>}
                          {listing.sqft != null && <span className="font-medium">{listing.sqft.toLocaleString()} sqft</span>}
                          {listing.propertyType && <span className="text-tertiary capitalize">{listing.propertyType}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-tertiary font-medium">
                            {commentCount_l > 0 ? `${commentCount_l} take${commentCount_l !== 1 ? "s" : ""}` : "No takes yet"}
                          </span>
                          <span className="text-xs font-bold text-amber group-hover:underline">
                            {commentCount_l > 0 ? "Read all takes" : "Drop your take"} &rarr;
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                }

                /* ── NEIGHBORHOOD SPOTLIGHT CARD (geo-aware) ── */
                if (item.type === "neighborhood") {
                  return (
                    <div key="neighborhood" className="px-0">
                      <GeoNeighborhoodSpotlight commentCount={commentCount} />
                    </div>
                  );
                }

                /* ── FOUNDER CARD — pinned tweet style ── */
                if (item.type === "founder") {
                  return (
                    <div key="founder" className="rounded-2xl border border-divider bg-surface shadow-card overflow-hidden">
                      {/* Pinned indicator */}
                      <div className="flex items-center gap-1.5 px-5 pt-3 pb-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                        </svg>
                        <span className="text-[11px] text-tertiary font-medium">Pinned</span>
                      </div>

                      <div className="p-5 pt-3">
                        {/* Author row — tweet style */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full bg-ink text-white text-sm font-extrabold flex items-center justify-center shrink-0">ZK</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-bold text-ink">Zachary Kaufman</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/15 text-amber font-bold">Founder</span>
                            </div>
                            <span className="text-[12px] text-tertiary">@zach · Building Gwaky</span>
                          </div>
                        </div>

                        {/* The take — big text like a tweet */}
                        <p className="text-[16px] sm:text-[18px] text-ink leading-relaxed mb-3">
                          I bought my place and my neighbors immediately told me things my realtor never mentioned. Un-permitted additions. Flooding history. Neighbor disputes that went on for years.
                        </p>
                        <p className="text-[16px] sm:text-[18px] text-ink leading-relaxed font-semibold mb-5">
                          If Gwaky existed, I would have had second thoughts. That&apos;s why I built it.
                        </p>

                        {/* Engagement row */}
                        <div className="flex items-center gap-6 pt-4 border-t border-divider">
                          <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span className="font-medium tabular-nums">{commentCount}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
                            <span>&#x2764;&#xFE0F;</span>
                            <span className="font-medium tabular-nums">{listingCount}</span>
                          </span>
                          <a href="/about" className="ml-auto text-xs font-bold text-amber hover:underline transition-colors">
                            Read the full story &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }

                /* ── HOW IT WORKS CARD ── */
                if (item.type === "how-it-works") {
                  return (
                    <div key="how-it-works" className="rounded-2xl border border-divider bg-surface shadow-card overflow-hidden">
                      <div className="p-6 sm:p-8">
                        <p className="text-[11px] font-extrabold tracking-[0.15em] uppercase text-amber mb-5">How it works</p>
                        <div className="grid grid-cols-3 gap-5">
                          {[
                            { step: "01", icon: "🏠", label: "Search any address or neighborhood" },
                            { step: "02", icon: "💬", label: "Read real takes from verified neighbors" },
                            { step: "03", icon: "🗣️", label: "Verify your zip and share what you know" },
                          ].map((s) => (
                            <div key={s.step} className="text-center">
                              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-highlight border border-divider flex items-center justify-center text-2xl shadow-soft">
                                {s.icon}
                              </div>
                              <p className="text-[10px] font-bold text-amber mb-1 tracking-wider">{s.step}</p>
                              <p className="text-xs text-ink font-semibold leading-tight">{s.label}</p>
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
          </div>

          {/* ── Load more / see all listings ── */}
          {(sortedListings.length > 0 || commentsFeedData.length > 0) && (
            <div className="max-w-2xl mx-auto px-5 py-8">
              <a
                href="/?sort=comments"
                className="block text-center py-4 bg-ink text-white rounded-2xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-elevated"
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
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
          <SplitMapLayout
            listings={sortedListings.map((l) => ({
              id: l.id,
              address: l.address,
              city: l.city,
              latitude: l.latitude ?? null,
              longitude: l.longitude ?? null,
              price: l.price,
              listingType: l.listingType,
            }))}
          >
          {sortedListings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-highlight border border-divider flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-ink mb-2">
                No listings yet for &ldquo;{city}&rdquo;
              </p>
              <p className="text-sm text-secondary max-w-md mx-auto mb-1">
                We&apos;re expanding fast. Try searching a nearby city or a more specific location like &ldquo;Santa Ana, CA&rdquo;.
              </p>
              <p className="text-xs text-tertiary max-w-sm mx-auto mb-6">
                Tip: Add a state abbreviation for best results (e.g. &ldquo;Austin, TX&rdquo;)
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="/" className="px-5 py-2.5 rounded-full bg-ink text-bg text-sm font-medium hover:opacity-90 transition-opacity">
                  Browse all listings
                </a>
                <a href="/?sort=comments" className="px-5 py-2.5 rounded-full border border-divider text-sm text-secondary hover:text-ink hover:border-ink/40 transition-colors">
                  See what&apos;s trending
                </a>
              </div>
              {/* Quick city suggestions */}
              <div className="mt-8 pt-6 border-t border-divider">
                <p className="text-xs text-tertiary mb-3">Popular cities with listings</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Los Angeles, CA", "Miami, FL", "Austin, TX", "Denver, CO", "Nashville, TN", "Seattle, WA"].map((c) => (
                    <a
                      key={c}
                      href={`/?city=${encodeURIComponent(c.split(",")[0].trim())}`}
                      className="px-3 py-1.5 rounded-full bg-highlight border border-divider text-xs text-secondary hover:text-ink hover:border-ink/20 transition-colors"
                    >
                      {c}
                    </a>
                  ))}
                </div>
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
          </SplitMapLayout>
        </div>
      )}

        </GeoProvider>
      </Suspense>
    </div>
  );
}
