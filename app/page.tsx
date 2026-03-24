import { Suspense } from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import GeoProvider from "@/components/GeoProvider";
import ListingFeed from "@/components/ListingFeed";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";
import CommentsFeed, { type CommentFeedItem } from "@/components/CommentsFeed";
import HotTakeOfTheDay from "@/components/HotTakeOfTheDay";
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Geolocation (invisible) */}
      <Suspense>
        <GeoProvider />
      </Suspense>

      {/* ====== HERO — only on default landing ====== */}
      {isDefaultLanding && (
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-divider px-6 sm:px-10 py-12 sm:py-20 mb-8 min-h-[480px] flex flex-col justify-center">
            {/* Hero lifestyle image */}
            <Image
              src="/images/hero-exterior-gwagon.png"
              alt="Luxury home"
              fill
              priority
              className="absolute inset-0 object-cover opacity-40"
              sizes="100vw"
            />
            {/* Dark gradient overlay — preserves readability over bg image */}
            <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg/80 to-surface/50 pointer-events-none" />
            {/* Accent glow — animated shimmer */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-hot/10 blur-3xl pointer-events-none amber-shimmer" />
            <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full bg-hot/5 blur-3xl pointer-events-none glow-pulse" />

            <div className="relative">
              {/* Byline — NYT kicker style */}
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-tertiary mb-4 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-hot/60" />
                your favorite local real estate
                <span className="inline-block w-1 h-1 rounded-full bg-tertiary/40" />
                Est. 2024
              </p>

              <h1 className="font-display text-4xl sm:text-6xl text-ink mb-5">
                get inside.<br />
                <span className="text-secondary font-normal" style={{ fontWeight: 300, letterSpacing: "-0.02em" }}>real talk on every listing.</span>
              </h1>

              <p className="text-secondary leading-relaxed max-w-lg mb-8">
                No agents. No spin. Just honest opinions from real people who know the neighborhood — insiders with nothing to sell.
              </p>

              {/* Hot takes examples */}
              <div className="space-y-2 mb-8 max-w-xl">
                {[
                  { take: "2847 Micheltorena — overpriced by $200K. Been watching this sit for 90 days.", author: "local_insider_la" },
                  { take: "That Silver Lake duplex asking $1.8M? Tenant has 4 years left on lease. Nobody mentions that.", author: "renter_rights_la" },
                  { take: "The flood zone disclosure is buried on page 14. Read before you offer.", author: "former_agent_310" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pl-3 border-l-2 border-hot/40">
                    <p className="text-[13px] text-secondary leading-snug">
                      🔥 <span className="text-ink/80 italic">&lsquo;{item.take}&rsquo;</span>{" "}
                      <span className="text-tertiary not-italic">— {item.author}</span>
                    </p>
                  </div>
                ))}
              </div>

              {(commentCount > 0 || listingCount > 0) && (
                <div className="flex items-center gap-6 pt-6 border-t border-divider">
                  {listingCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-ink tracking-tight">{listingCount.toLocaleString()}</p>
                      <p className="text-[11px] text-tertiary uppercase tracking-wider mt-0.5">Active listings</p>
                    </div>
                  )}
                  {commentCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-ink tracking-tight">{commentCount.toLocaleString()}</p>
                      <p className="text-[11px] text-tertiary uppercase tracking-wider mt-0.5">Insider takes</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== SEARCH ====== */}
      <div className="mb-8">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* ====== WHAT PEOPLE ARE SAYING — landing page only ====== */}
      {isDefaultLanding && commentsFeedData.length > 0 && (
        <div className="mb-12">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-tertiary mb-1">Live takes</p>
              <h2 className="text-xl font-bold text-ink tracking-tight">What insiders are saying</h2>
            </div>
            <a href="/?sort=comments" className="text-sm text-secondary hover:text-ink transition-colors">
              See all →
            </a>
          </div>
          <CommentsFeed comments={commentsFeedData.slice(0, 6)} />
        </div>
      )}

      {/* ====== SORT + FILTER BAR ====== */}
      {(hasFilters || !isDefaultLanding) && (
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
                { key: "comments", label: "🔥 Trending" },
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
      )}

      {/* ====== LISTINGS GRID ====== */}
      {isDefaultLanding && sortedListings.length > 0 && (
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-tertiary mb-1">Just listed</p>
            <h2 className="text-xl font-bold text-ink tracking-tight">Latest listings</h2>
          </div>
        </div>
      )}

      {sortedListings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏠</div>
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
  );
}
