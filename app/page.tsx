import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import GeoProvider from "@/components/GeoProvider";
import ListingFeed from "@/components/ListingFeed";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";
import FallbackImage from "@/components/FallbackImage";
import RecentlyViewed from "@/components/RecentlyViewed";
import LocationBanner from "@/components/LocationBanner";
import HotTakeOfTheDay from "@/components/HotTakeOfTheDay";
import CommunityPulse from "@/components/CommunityPulse";
import BrowseByNeighborhood from "@/components/NeighborhoodCard";
import CommentsFeed, { type CommentFeedItem } from "@/components/CommentsFeed";
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

  const hasFilters = !!(city || listingType || propertyType || minPrice || maxPrice || minBeds || minBaths || minSqft || maxSqft);
  const isDefaultLanding = !hasFilters && sort === "newest";

  // Community stats + trending + recent activity + comments feed — only on default landing
  const [listingCount, commentCount, reactionCount, trending, recentComments, latestCommentsFeed] = isDefaultLanding
    ? await Promise.all([
        prisma.listing.count({ where: { status: "active" } }),
        prisma.comment.count(),
        prisma.reaction.count(),
        prisma.listing.findMany({
          where: { status: "active" },
          orderBy: { comments: { _count: "desc" } },
          take: 6,
          select: {
            id: true, address: true, city: true, state: true, price: true,
            listingType: true, photos: true,
            _count: { select: { comments: true } },
            comments: { take: 1, orderBy: { createdAt: "desc" }, select: { name: true, content: true } },
          },
        }),
        // Recent comments for the activity ticker
        prisma.comment.findMany({
          take: 12,
          orderBy: { createdAt: "desc" },
          select: {
            name: true,
            content: true,
            createdAt: true,
            listing: { select: { city: true, state: true, price: true, listingType: true } },
          },
        }),
        // THE MAIN EVENT: latest comments feed for the homepage
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
    : [0, 0, 0, [], [], []];

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

  // Auto-sync: fire-and-forget — don't block page render
  if (city) {
    void (async () => {
      try {
        await autoSyncCity(city);
      } catch (e) {
        console.error("[AutoSync] Error:", e);
      }
    })();
  }

  // Detect if this looks like an address search (has numbers + street words)
  const looksLikeAddress = city ? /\d+\s+\w+/.test(city) : false;

  // Build where clause — include off_market listings in search results
  const conditions: Prisma.ListingWhereInput[] = [
    { status: { in: ["active", "off_market"] } },
  ];

  // Skip city text filter when doing geo search — haversine handles proximity
  if (city && !isGeoSearch) {
    // Split search into individual words for better matching
    const words = city.split(/[\s,]+/).filter(w => w.length > 1);
    conditions.push({
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
        { address: { contains: city, mode: "insensitive" } },
        // Also try matching all individual words against address
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

  // Determine sort order
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
    // "Hot Takes" / Outrageous: most expensive + worst price-per-sqft
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

    // Interleave expensive and worst-deal, dedup by ID
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
      const R = 3959; // miles
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

  // If address search returned 0 results, try direct address lookup (no self-fetch)
  let addressLookupResult: { id: string; address: string; city: string; state: string; status: string } | null = null;
  if (listings.length === 0 && city && looksLikeAddress) {
    try {
      const lookupData = await lookupAddress(city);
      if (lookupData.results.length > 0) {
        // Re-query from DB now that it's been upserted
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

  // Filter trending to only listings that actually have comments
  const trendingWithComments = trending.filter((t) => t._count.comments > 0);

  // Community stats for filtered views (banners)
  const filteredCommentCount = hasFilters
    ? await prisma.comment.count({
        where: { listing: where },
      }).catch(() => 0)
    : 0;

  // Fetch community moments for the feed (random highlighted comments)
  const communityMoments = hasFilters
    ? await prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: {
          listing: { status: { in: ["active", "off_market"] } },
        },
        select: {
          id: true,
          name: true,
          content: true,
          listing: {
            select: { id: true, address: true, city: true, state: true },
          },
        },
      }).catch(() => [])
    : [];

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Geolocation + analytics (invisible) */}
      <Suspense>
        <GeoProvider />
      </Suspense>

      {/* ====== HERO — only on default landing ====== */}
      {isDefaultLanding && (
        <div className="mb-6 sm:mb-8">
          {/* Punchy headline */}
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tighter leading-[1.1]">
            gwak<span className="social-gradient">gwak</span>
          </h1>
          <p className="text-sm sm:text-base text-muted mt-1.5 max-w-md">
            the comment section of real estate.
          </p>

          {/* Live community stats */}
          {(commentCount > 0 || listingCount > 0) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              {commentCount > 0 && (
                <div className="flex items-center gap-2 bg-social-light border border-social/10 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-social live-dot" />
                  <span className="text-[13px] font-semibold text-social">
                    {commentCount.toLocaleString()} opinions shared
                  </span>
                </div>
              )}
              {reactionCount > 0 && (
                <span className="text-sm text-muted">
                  {"🔥"} <span className="font-semibold text-ink">{reactionCount.toLocaleString()}</span> reactions
                </span>
              )}
              {listingCount > 0 && (
                <span className="text-sm text-muted">
                  across <span className="font-semibold text-ink">{listingCount.toLocaleString()}</span> listings
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====== WHAT PEOPLE ARE SAYING — THE MAIN EVENT (default landing) ====== */}
      {isDefaultLanding && commentsFeedData.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{"💬"}</span>
            <h2 className="font-display text-base font-bold text-ink uppercase tracking-widest">
              What People Are Saying
            </h2>
            <span className="text-[11px] font-semibold text-social bg-social-light px-2 py-0.5 rounded-full">
              Live
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <CommentsFeed comments={commentsFeedData} />
        </div>
      )}

      {/* ====== HOT TAKE OF THE DAY — the viral hook (default landing only) ====== */}
      {isDefaultLanding && (
        <Suspense fallback={<div className="h-48 skeleton rounded-2xl my-8" />}>
          <HotTakeOfTheDay />
        </Suspense>
      )}

      {/* ====== COMMUNITY PULSE — live stats (default landing only) ====== */}
      {isDefaultLanding && (
        <Suspense fallback={<div className="h-32 skeleton rounded-xl my-8" />}>
          <CommunityPulse />
        </Suspense>
      )}

      {/* ====== TRENDING CONVERSATIONS — only on default landing ====== */}
      {isDefaultLanding && trendingWithComments.length > 0 && (
        <div className="mt-8 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{"💬"}</span>
            <h2 className="font-display text-base font-bold text-ink uppercase tracking-widest">
              Trending Conversations
            </h2>
            <span className="text-[11px] font-semibold text-social bg-social-light px-2 py-0.5 rounded-full">
              Most discussed
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingWithComments.slice(0, 6).map((t) => {
              const photo = t.photos[0];
              const isRent = t.listingType === "rent";
              const price = isRent
                ? `$${t.price.toLocaleString()}/mo`
                : `$${t.price.toLocaleString()}`;
              const latestComment = t.comments[0];
              return (
                <a
                  key={t.id}
                  href={`/listing/${t.id}`}
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex gap-3 p-4">
                    {/* Thumbnail */}
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
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{price}</p>
                      <p className="text-[12px] text-muted truncate">{t.address}</p>
                      <p className="text-[11px] text-muted truncate">{t.city}, {t.state}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-social bg-social-light px-1.5 py-0.5 rounded">
                        {"💬"} {t._count.comments} comment{t._count.comments !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {/* Latest comment snippet — the social hook */}
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
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== RECENT ACTIVITY TICKER — only on default landing ====== */}
      {isDefaultLanding && recentComments.length > 0 && (
        <div className="mt-6 mb-4 overflow-hidden rounded-xl border border-border bg-white">
          <div className="px-4 py-2 border-b border-border bg-tag/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-social live-dot" />
            <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">Live Activity</span>
          </div>
          <div className="overflow-hidden relative">
            <div className="flex ticker-scroll whitespace-nowrap py-3">
              {[...recentComments, ...recentComments].map((c, i) => {
                const isRent = c.listing.listingType === "rent";
                const price = isRent
                  ? `$${c.listing.price.toLocaleString()}/mo`
                  : `$${c.listing.price.toLocaleString()}`;
                return (
                  <span key={i} className="inline-flex items-center gap-2 px-4 text-[13px] border-r border-border last:border-0">
                    <span className="font-semibold text-ink">{c.name}</span>
                    <span className="text-muted truncate max-w-[200px]">&ldquo;{c.content.slice(0, 60)}{c.content.length > 60 ? "..." : ""}&rdquo;</span>
                    <span className="text-[11px] text-muted/50 shrink-0">on {price} in {c.listing.city}</span>
                  </span>
                );
              })}
            </div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* ====== BROWSE BY NEIGHBORHOOD — only on default landing ====== */}
      {isDefaultLanding && (
        <Suspense fallback={<div className="h-40 skeleton rounded-xl my-8" />}>
          <BrowseByNeighborhood />
        </Suspense>
      )}

      {/* ====== RECENTLY VIEWED ====== */}
      <div className="mt-6">
        <RecentlyViewed />
      </div>

      {/* ====== MODE TOGGLE — always prominent ====== */}
      {(() => {
        const makeHref = (typeVal: string) => {
          const p = new URLSearchParams(
            Object.fromEntries(
              Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]
            )
          );
          if (typeVal) p.set("type", typeVal); else p.delete("type");
          p.delete("page");
          return `/?${p.toString()}`;
        };
        const current = listingType ?? "";
        return (
          <div className="mb-6 sm:mb-8">
            {/* Mode toggle bar */}
            <div className="flex items-center gap-1 bg-ink/[0.04] rounded-2xl p-1.5 mb-4 w-fit">
              {[
                { key: "", label: "All Listings", icon: "\uD83C\uDFD8\uFE0F" },
                { key: "sale", label: "Buy", icon: "\uD83C\uDFE1" },
                { key: "rent", label: "Rent", icon: "\uD83D\uDD11" },
              ].map((t) => {
                const isActive = current === t.key;
                const activeClasses = t.key === "sale"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : t.key === "rent"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white text-ink shadow-lg";
                return (
                  <a
                    key={t.key}
                    href={makeHref(t.key)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive ? activeClasses : "text-muted hover:text-ink hover:bg-white/60"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </a>
                );
              })}
            </div>

            {/* Context banner — what you're viewing */}
            {listingType && (
              <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                listingType === "sale"
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-200/60"
                  : "bg-gradient-to-r from-blue-50 to-blue-50/30 border border-blue-200/60"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                    listingType === "sale" ? "bg-emerald-100" : "bg-blue-100"
                  }`}>
                    {listingType === "sale" ? "\uD83C\uDFE1" : "\uD83D\uDD11"}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      listingType === "sale" ? "text-emerald-800" : "text-blue-800"
                    }`}>
                      {listingType === "sale" ? "Homes for Sale" : "Rentals"}
                      {city && <span className="font-normal text-xs ml-1.5 opacity-70">in {city}</span>}
                    </p>
                    <p className={`text-[11px] ${
                      listingType === "sale" ? "text-emerald-600" : "text-blue-600"
                    }`}>
                      {listingType === "sale"
                        ? `${total} home${total !== 1 ? "s" : ""} for sale`
                        : `${total} rental${total !== 1 ? "s" : ""}`}
                      {filteredCommentCount > 0 && ` · ${filteredCommentCount} people are talking about these`}
                      {filteredCommentCount === 0 && ` · See what people are saying`}
                    </p>
                  </div>
                </div>
                <a
                  href={makeHref(listingType === "sale" ? "rent" : "sale")}
                  className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    listingType === "sale"
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/50"
                      : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50"
                  }`}
                >
                  Switch to {listingType === "sale" ? "Rent \uD83D\uDD11" : "Buy \uD83C\uDFE1"}
                </a>
              </div>
            )}

            {/* Community context banner — when no specific type is selected but filters are active */}
            {hasFilters && !listingType && total > 0 && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-50/30 border border-orange-200/60 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-orange-100">
                  {"\uD83C\uDFD8\uFE0F"}
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-800">
                    {total} listing{total !== 1 ? "s" : ""}
                    {city && <span className="font-normal text-xs ml-1.5 opacity-70">in {city}</span>}
                  </p>
                  <p className="text-[11px] text-orange-600">
                    {filteredCommentCount > 0
                      ? `${filteredCommentCount} conversation${filteredCommentCount !== 1 ? "s" : ""} happening`
                      : "Be the first to share your take"}
                  </p>
                </div>
              </div>
            )}

            {/* Title + sort row */}
            <div className="flex items-end justify-between gap-4 flex-wrap mt-4">
              <div>
                {hasFilters && !listingType && (
                  <p className="text-[13px] text-muted mb-1">
                    {total} result{total !== 1 ? "s" : ""}
                  </p>
                )}
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tighter">
                  {city
                    ? city
                    : sort === "comments"
                      ? "\uD83D\uDD25 Hot Takes"
                      : "Explore"
                  }
                </h1>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-0.5 text-[13px]">
                {[
                  { key: "newest", label: "New" },
                  { key: "comments", label: "\uD83D\uDD25 Hot Takes" },
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
                      className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                        isActive
                          ? s.key === "comments" ? "bg-social text-white" : "bg-ink text-white"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {s.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Location banner — smart geo-aware context */}
      <Suspense>
        <LocationBanner />
      </Suspense>

      {/* Search + filters */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* ====== LISTING GRID ====== */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{"\uD83C\uDFDA\uFE0F"}</p>
          <p className="font-display text-lg font-semibold text-ink mb-1">
            No active listings in this area
          </p>
          <p className="text-sm text-muted max-w-md mx-auto">
            But that doesn&apos;t mean the conversation is over. People are still
            talking about homes nearby.
          </p>

          {/* Recent community activity from other areas */}
          {communityMoments.length > 0 && (
            <div className="mt-8 max-w-md mx-auto text-left">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 text-center">
                Recent conversations nearby
              </p>
              <div className="space-y-2">
                {communityMoments.slice(0, 3).map((c) => (
                  <a
                    key={c.id}
                    href={`/listing/${c.listing.id}`}
                    className="block bg-white border border-border rounded-lg px-4 py-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <p className="text-[12px] text-muted line-clamp-2">
                      <span className="font-semibold text-ink">{c.name}</span>
                      {" on "}
                      <span className="text-ink">{c.listing.address}</span>
                      {": "}
                      &ldquo;{c.content.slice(0, 80)}{c.content.length > 80 ? "..." : ""}&rdquo;
                    </p>
                    <p className="text-[11px] text-muted/60 mt-1">{c.listing.city}, {c.listing.state}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6">
            <a href="/" className="text-sm font-semibold text-social hover:text-social/80 transition-colors">
              &larr; Back to all listings
            </a>
            <a href="/?sort=comments" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
              See trending conversations &rarr;
            </a>
          </div>
        </div>
      ) : (
        <ListingFeed
          initialListings={sortedListings}
          initialHasMore={hasMore}
          searchParams={feedParams}
          communityMoments={communityMoments.map((c) => ({
            id: c.id,
            name: c.name,
            content: c.content,
            listingId: c.listing.id,
            address: c.listing.address,
            city: c.listing.city,
            state: c.listing.state,
          }))}
        />
      )}
    </div>
  );
}
