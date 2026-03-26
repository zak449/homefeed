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
  const [listingCount, commentCount, latestCommentsFeed, hottestTakeRaw] = isDefaultLanding
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
        // Fetch the #1 most-reacted comment for the hero
        prisma.$queryRaw<{ id: string }[]>`
          SELECT c.id
          FROM "Comment" c
          LEFT JOIN "Reaction" r ON r."commentId" = c.id
          GROUP BY c.id
          ORDER BY COUNT(r.id) DESC
          LIMIT 1
        `.then(async (rows) => {
          if (rows.length === 0) return null;
          return prisma.comment.findUnique({
            where: { id: rows[0].id },
            include: {
              listing: {
                select: { id: true, address: true, city: true, state: true, price: true, photos: true, listingType: true },
              },
              reactions: true,
            },
          });
        }),
      ])
    : [0, 0, [], null];

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

  // Map hottest take for hero
  const hottestTake = hottestTakeRaw ? {
    id: hottestTakeRaw.id,
    name: hottestTakeRaw.name,
    content: hottestTakeRaw.content,
    createdAt: hottestTakeRaw.createdAt.toISOString(),
    reactions: hottestTakeRaw.reactions.map((r: { type: string }) => ({ type: r.type })),
    listing: {
      id: hottestTakeRaw.listing.id,
      address: hottestTakeRaw.listing.address,
      city: hottestTakeRaw.listing.city,
      state: hottestTakeRaw.listing.state,
      price: hottestTakeRaw.listing.price,
      photos: hottestTakeRaw.listing.photos,
      listingType: hottestTakeRaw.listing.listingType,
    },
  } : null;

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
;

  const feedItems: FeedItem[] = [];

  if (isDefaultLanding) {
    const takes = [...commentsFeedData];
    const listings_pool = [...sortedListings];
    // Pattern: take, take, neighborhood, listing, take, founder, listing, listing, then remaining
    const pattern: FeedItem["type"][] = [
      "take", "take", "neighborhood", "listing", "take", "founder",
      "listing", "listing",
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

  /* ── Helper: first name + last initial ── */
  function formatName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  /* ── Helper: strip [role] tag from comment content ── */
  function parseRoleTag(content: string): string {
    return content.replace(/^\[([^\]]+)\]\s*/, "");
  }

  /* ── Category pills — each links to a real filtered view ── */
  const categories = [
    { label: "Most Unhinged", emoji: "🔥", href: "/?sort=comments" },
    { label: "Just Dropped", emoji: "🆕", href: "/?sort=newest" },
    { label: "Red Flags", emoji: "🚩", href: "/?sort=comments&type=sale" },
    { label: "Price Check", emoji: "💀", href: "/?sort=price-low" },
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

          {/* ═══ HERO — HOTTEST TAKE SHOWCASE ═══ */}
          <div className="relative overflow-hidden" style={{ background: '#0A0A0A' }}>
            {/* Subtle amber glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]" style={{ background: 'radial-gradient(circle, #FF4D00, transparent 70%)' }} />

            <div className="relative max-w-3xl mx-auto px-5 pt-8 pb-6 sm:pt-12 sm:pb-10">
              {/* Big heading */}
              <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-extrabold tracking-tighter font-display leading-[1.05] mb-4 text-white">
                Real estate finally has a <span className="text-amber">comment section.</span>
              </h1>

              {/* Subtext */}
              <p className="text-[clamp(0.95rem,2.5vw,1.2rem)] text-white/50 font-medium tracking-tight mb-6 sm:mb-8 max-w-xl">
                See what neighbors, past renters, and drive-by experts are really saying.
              </p>

              {/* ── HOTTEST TAKE CARD ── */}
              {hottestTake && (() => {
                const htReactions: Record<string, number> = {};
                for (const r of hottestTake.reactions) {
                  htReactions[r.type] = (htReactions[r.type] || 0) + 1;
                }
                const htPhoto = hottestTake.listing.photos[0];
                const htShortAddr = hottestTake.listing.address.split(",")[0];
                const htNameParts = hottestTake.name.trim().split(/\s+/);
                const htDisplayName = htNameParts.length > 1
                  ? `${htNameParts[0]} ${htNameParts[htNameParts.length - 1][0]}.`
                  : htNameParts[0];
                const htLower = hottestTake.content.toLowerCase();
                let htCredLabel = "Anon";
                if (/\b(years?|lived here|moved|since)\b/.test(htLower)) htCredLabel = "Local";
                else if (/\b(rent|tenant|lease)\b/.test(htLower)) htCredLabel = "Past Renter";
                else if (/\b(neighbor|next door|block)\b/.test(htLower)) htCredLabel = "Neighbor";

                return (
                  <a href={`/listing/${hottestTake.listing.id}`} className="block group mb-6 sm:mb-8 rounded-2xl bg-surface border border-divider shadow-lg hover:shadow-xl hover:border-amber/30 transition-all duration-300 overflow-hidden">
                    {/* Listing context */}
                    <div className="flex items-center gap-3 p-4 pb-0">
                      {htPhoto && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-elevated">
                          <FallbackImage src={htPhoto} alt={htShortAddr} className="w-full h-full object-cover" loading="eager" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{htShortAddr}</p>
                        <p className="text-xs text-white/40">{fmtPrice(hottestTake.listing.price, hottestTake.listing.listingType)} &middot; {hottestTake.listing.city}, {hottestTake.listing.state}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/20 shrink-0">#1 take</span>
                    </div>
                    {/* The take */}
                    <div className="px-4 pt-3 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-white/90">{htDisplayName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/40">{htCredLabel}</span>
                      </div>
                      <p className="text-lg font-bold text-white leading-snug">{hottestTake.content}</p>
                    </div>
                    {/* Reactions */}
                    <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
                      {["🚩", "💸", "👀", "🔥", "💀"].map((emoji) => {
                        const count = htReactions[emoji] || 0;
                        return (
                          <span key={emoji} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                            count > 0 ? "bg-white/5 border-white/10 text-white/80" : "bg-white/[0.02] border-white/5 text-white/30"
                          }`}>
                            <span className="text-sm">{emoji}</span>
                            <span className="tabular-nums">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </a>
                );
              })()}

              {/* ── SEARCH BAR ── */}
              <div className="mb-6">
                <Suspense>
                  <SearchBar />
                </Suspense>
              </div>

              {/* ── CTA BUTTON ── */}
              <a
                href="/?sort=comments"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber text-white rounded-2xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-elevated mb-4"
              >
                Browse listings &rarr;
              </a>

              {/* ── STATS BAR ── */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white/80 tabular-nums">{listingCount.toLocaleString()}</span>
                  <span className="text-sm text-white/30">listings</span>
                </div>
                <span className="text-white/10">&middot;</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/80 tabular-nums">{commentCount.toLocaleString()}</span>
                  <span className="text-sm text-white/30">takes</span>
                </div>
                <span className="text-white/10">&middot;</span>
                <span className="text-sm text-white/30">any city in the US</span>
              </div>
            </div>
          </div>

          {/* ═══ CATEGORY PILLS — tactile, visual ═══ */}
          <div className="sticky top-12 z-20 bg-bg border-b border-divider/0 backdrop-blur-sm" style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-5 py-4">
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 pr-8">
                <GeoCategoryPill />
                {categories.map((cat) => (
                  <a
                    key={cat.label}
                    href={cat.href}
                    className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface border border-divider text-sm font-medium text-ink shadow-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </a>
                ))}
              </div>
              {/* Fade gradient indicating more scrollable content */}
              <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-bg to-transparent" />
            </div>
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
                  const reactionCounts: Record<string, number> = {};
                  for (const r of comment.reactions) {
                    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
                  }

                  // formatName: first name + last initial
                  const nameParts = comment.name.trim().split(/\s+/);
                  const formatName = nameParts.length > 1
                    ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
                    : nameParts[0];

                  // Credibility tags
                  const credTags: string[] = [];
                  const lowerContent = comment.content.toLowerCase();
                  if (lowerContent.includes("rent") || lowerContent.includes("tenant") || lowerContent.includes("lease")) credTags.push("past renter");
                  else if (lowerContent.includes("neighbor") || lowerContent.includes("block") || lowerContent.includes("street")) credTags.push("neighbor");
                  else if (lowerContent.includes("bought") || lowerContent.includes("buyer") || lowerContent.includes("offer")) credTags.push("buyer");
                  else credTags.push("local");

                  // Short address
                  const shortAddr = comment.listing.address.split(",")[0];

                  return (
                    <div key={`take-${comment.id}`} className="rounded-2xl bg-surface border border-divider shadow-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 overflow-hidden cursor-pointer">
                      {/* Author row */}
                      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
                        <span className="text-sm font-bold text-ink">{formatName}</span>
                        <span className="text-tertiary/40">&middot;</span>
                        <span className="text-xs text-tertiary truncate">{comment.listing.city}, {comment.listing.state}</span>
                      </div>
                      {/* Credibility tag */}
                      <div className="px-5 pb-3">
                        {credTags.map((tag) => (
                          <span key={tag} className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 mr-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* THE TAKE — hero text, large, bold, no quotes */}
                      <div className="px-5 pb-4">
                        <p className="text-lg font-bold text-ink leading-snug">
                          {parseRoleTag(comment.content)}
                        </p>
                      </div>

                      {/* Listing evidence — small thumbnail */}
                      <a href={`/listing/${comment.listing.id}`} className="block group/listing px-5 pb-4">
                        <div className="relative w-full aspect-[3/1] overflow-hidden bg-highlight rounded-lg">
                          {photo ? (
                            <FallbackImage
                              src={photo}
                              alt={comment.listing.address}
                              className="w-full h-full object-cover group-hover/listing:scale-[1.03] transition-transform duration-700"
                              loading={idx < 3 ? "eager" : "lazy"}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-ink/80 mt-2 truncate">
                          {shortAddr} &middot; {fmtPrice(comment.listing.price, comment.listing.listingType)} &middot; {comment.listing.listingType === "rent" ? "Rental" : "For Sale"}
                        </p>
                      </a>

                      {/* CTA */}
                      <div className="flex items-center justify-end px-5 pb-4 pt-1 border-t border-divider mx-5 mb-1">
                        <a
                          href={`/listing/${comment.listing.id}#comment-form`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full hover:bg-accent/20 transition-all shrink-0"
                        >
                          Drop your take &rarr;
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
                    <a key={`listing-${listing.id}`} href={`/listing/${listing.id}`} className="block group rounded-2xl bg-surface border border-divider shadow-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 overflow-hidden cursor-pointer">
                      {/* Top comment — HEADLINE above photo */}
                      {listing.topComment && (
                        <div className="px-5 pt-5 pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-amber">
                                {listing.topComment.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-ink">{formatName(listing.topComment.name)}</span>
                          </div>
                          <p className="text-[16px] sm:text-[17px] text-ink leading-snug font-semibold">
                            {parseRoleTag(listing.topComment.content)}
                          </p>
                        </div>
                      )}

                      {/* Photo */}
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
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                            {listing.listingType === "rent" ? "Rental" : "For Sale"}
                          </span>
                          {listing.status === "active" && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/80 backdrop-blur-md text-white">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        {!listing.topComment && (
                          <p className="text-[15px] text-tertiary italic mb-4">Be the first to drop intel on this block.</p>
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
                          <span className="inline-flex items-center gap-1 px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full group-hover:bg-accent/20 transition-all">
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
                        <span className="text-xs text-tertiary font-medium">Pinned</span>
                      </div>

                      <div className="p-5 pt-3">
                        {/* Author row — tweet style */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full bg-amber text-white text-sm font-extrabold flex items-center justify-center shrink-0">ZK</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-bold text-ink">Zachary Kaufman</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber/15 text-amber font-bold">Founder</span>
                            </div>
                            <span className="text-xs text-tertiary">@zach · Building Gwaky</span>
                          </div>
                        </div>

                        {/* The take — big text like a tweet */}
                        <p className="text-[16px] sm:text-[18px] text-ink leading-relaxed mb-3">
                          When I moved in, meeting my neighbors changed everything. They told me which contractor to trust, warned me about a drainage issue I needed to fix before winter, and showed me the hiking trail nobody knows about.
                        </p>
                        <p className="text-[16px] sm:text-[18px] text-ink leading-relaxed font-semibold mb-5">
                          That&apos;s when I realized — the best intel about any home comes from the people who actually live on the block. I built Gwaky so every buyer gets that before they sign.
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

                return null;
              })}
            </div>
          </div>

          {/* ── Load more / see all listings ── */}
          {(sortedListings.length > 0 || commentsFeedData.length > 0) && (
            <div className="max-w-2xl mx-auto px-5 py-8">
              <a
                href="/?sort=comments"
                className="block text-center py-4 bg-amber text-white rounded-2xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-elevated"
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
              <div className="relative">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-6">
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
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
                          isActive
                            ? "bg-accent text-white font-medium"
                            : "text-secondary hover:bg-surface hover:text-ink"
                        }`}
                      >
                        {s.label}
                      </a>
                    );
                  })}
                </div>
                {/* Fade gradient indicating more scrollable content */}
                <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-bg to-transparent" />
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
                <a href="/" className="px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
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
                      className="px-3 py-1.5 rounded-full bg-highlight border border-divider text-xs text-secondary hover:text-ink hover:border-divider transition-colors"
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
