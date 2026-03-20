import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import GeoProvider from "@/components/GeoProvider";
import ListingFeed from "@/components/ListingFeed";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";
import FallbackImage from "@/components/FallbackImage";
import RecentlyViewed from "@/components/RecentlyViewed";

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

  // Community stats + trending + recent activity — only on default landing
  const [listingCount, commentCount, reactionCount, trending, recentComments] = isDefaultLanding
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
        // Recent comments for the activity feed
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
      ])
    : [0, 0, 0, [], []];

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

  // Build where clause
  const conditions: Prisma.ListingWhereInput[] = [
    { status: "active" },
  ];

  // Skip city text filter when doing geo search — haversine handles proximity
  if (city && !isGeoSearch) {
    conditions.push({
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
        { address: { contains: city, mode: "insensitive" } },
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

  // Map listings to include topComment
  const withComments = listings.map((l) => ({
    ...l,
    topComment: l.comments?.[0] ?? null,
  }));

  let sortedListings = withComments;

  const hasMore = perPage < total;

  // Filter trending to only listings that actually have comments
  const trendingWithComments = trending.filter((t) => t._count.comments > 0);

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
        <div className="mb-8 sm:mb-12">
          {/* Main headline */}
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tighter leading-[1.1]">
            Every listing has a<br />
            <span className="social-gradient">comment section.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted mt-3 max-w-lg">
            See what neighbors, agents, and locals actually think about properties — not just the listing price. Browse, react, and weigh in.
          </p>

          {/* Live community stats */}
          {(commentCount > 0 || listingCount > 0) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
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
                  🔥 <span className="font-semibold text-ink">{reactionCount.toLocaleString()}</span> reactions
                </span>
              )}
              {listingCount > 0 && (
                <span className="text-sm text-muted">
                  across <span className="font-semibold text-ink">{listingCount.toLocaleString()}</span> listings
                </span>
              )}
            </div>
          )}

          {/* Recent activity ticker — shows the app is alive */}
          {recentComments.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
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
        </div>
      )}

      {/* ====== HEADER area ====== */}
      <div className="mb-6 sm:mb-8">
        {hasFilters && (
          <p className="text-[13px] text-muted mb-1">
            {total} result{total !== 1 ? "s" : ""}
          </p>
        )}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tighter">
              {city
                ? city
                : sort === "comments"
                  ? "🔥 Hot Takes"
                  : "Explore"
              }
            </h1>
            {/* Type pills */}
            <div className="flex items-center gap-0.5 bg-tag rounded-lg p-0.5">
              {[
                { key: "", label: "All" },
                { key: "sale", label: "Buy" },
                { key: "rent", label: "Rent" },
              ].map((t) => {
                const params = new URLSearchParams(
                  Object.fromEntries(
                    Object.entries(sp)
                      .filter(([, v]) => typeof v === "string") as [string, string][]
                  )
                );
                if (t.key) params.set("type", t.key); else params.delete("type");
                params.delete("page");
                const isActive = (listingType ?? "") === t.key;
                return (
                  <a
                    key={t.key}
                    href={`/?${params.toString()}`}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-white text-ink shadow-button"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </a>
                );
              })}
            </div>
          </div>
          {/* Sort */}
          <div className="flex items-center gap-0.5 text-[13px]">
            {[
              { key: "newest", label: "New" },
              { key: "comments", label: "🔥 Hot Takes" },
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

      {/* Search + filters */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* Buy/Rent mode banner */}
      {listingType === "sale" && (
        <div className="mt-4 mb-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-green-700">
            Browsing homes for sale
          </span>
          <a
            href={(() => {
              const p = new URLSearchParams(
                Object.fromEntries(
                  Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]
                )
              );
              p.set("type", "rent");
              p.delete("page");
              return `/?${p.toString()}`;
            })()}
            className="text-[12px] font-medium text-green-600 hover:text-green-800 transition-colors"
          >
            Switch to rentals &rarr;
          </a>
        </div>
      )}
      {listingType === "rent" && (
        <div className="mt-4 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-blue-700">
            Browsing rentals
          </span>
          <a
            href={(() => {
              const p = new URLSearchParams(
                Object.fromEntries(
                  Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]
                )
              );
              p.set("type", "sale");
              p.delete("page");
              return `/?${p.toString()}`;
            })()}
            className="text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Switch to homes for sale &rarr;
          </a>
        </div>
      )}

      {/* Recently Viewed */}
      <div className="mt-6">
        <RecentlyViewed />
      </div>

      {/* ====== TRENDING CONVERSATIONS — only on default landing ====== */}
      {isDefaultLanding && trendingWithComments.length > 0 && (
        <div className="mt-8 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-base font-bold text-ink">
              Trending Conversations
            </h2>
            <span className="text-[11px] font-semibold text-social bg-social-light px-2 py-0.5 rounded-full">
              Most discussed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingWithComments.slice(0, 3).map((t) => {
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
                        💬 {t._count.comments} comment{t._count.comments !== 1 ? "s" : ""}
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

      {/* ====== LISTING GRID ====== */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="font-display text-lg font-semibold text-ink mb-1">No listings here yet</p>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Try searching a city to see what people are saying about homes in that area.
          </p>
          <a href="/" className="inline-block mt-5 text-sm font-semibold text-social hover:text-social/80 transition-colors">
            &larr; Back to all listings
          </a>
        </div>
      ) : (
        <ListingFeed
          initialListings={sortedListings}
          initialHasMore={hasMore}
          searchParams={feedParams}
        />
      )}
    </div>
  );
}
