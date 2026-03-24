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

      {/* ====== THE WORLD — you land and you're IN IT ====== */}
      {isDefaultLanding && (
        <>
          {/* ── HERO — dark, bold, immediate ── */}
          <div className="bg-ink rounded-2xl p-6 sm:p-10 mb-6 relative overflow-hidden">
            {/* Subtle ambient glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center max-w-xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                What are people saying about{" "}
                <span className="text-[#E8A87C]">your neighborhood</span>?
              </h1>
              <p className="text-sm sm:text-base text-white/50 mb-6 max-w-md mx-auto">
                Enter your zip code. See what your neighbors are really saying about the homes around you.
              </p>
              <Suspense>
                <SearchBar />
              </Suspense>

              {/* Live activity pulse */}
              {commentCount > 0 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-xs text-white/40">
                    {commentCount.toLocaleString()} takes across {listingCount.toLocaleString()} listings
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── LIVE TAKES — the heartbeat, pulls you in ── */}
          {commentsFeedData.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-ink">Live takes happening now</h2>
                </div>
                <a href="/?sort=comments" className="text-xs font-semibold text-amber hover:underline">
                  See all &rarr;
                </a>
              </div>
              <CommentsFeed comments={commentsFeedData.slice(0, 4)} />
              <a
                href="/?sort=comments"
                className="block mt-4 text-center py-3 bg-ink text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Read more takes from verified neighbors &rarr;
              </a>
            </div>
          )}

          {/* ── VALUE PROPS — why you stay ── */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {/* Card 1: The pain */}
            <div className="bg-surface border border-divider rounded-2xl p-6 relative overflow-hidden group hover:border-amber/20 hover:shadow-soft transition-all">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber/5 rounded-full blur-2xl group-hover:bg-amber/10 transition-colors" />
              <div className="relative">
                <div className="text-3xl mb-3">😤</div>
                <h3 className="text-base font-bold text-ink mb-1.5">Buying blind is over.</h3>
                <p className="text-sm text-secondary leading-relaxed mb-4">
                  87% of buyers say they wish they knew more before signing. Your realtor has an agenda. Your neighbors don&apos;t.
                </p>
                <a href="/?sort=comments" className="inline-flex items-center gap-1 text-sm font-semibold text-amber hover:underline">
                  See what people are really saying
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
            {/* Card 2: The solution */}
            <div className="bg-surface border border-divider rounded-2xl p-6 relative overflow-hidden group hover:border-amber/20 hover:shadow-soft transition-all">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber/5 rounded-full blur-2xl group-hover:bg-amber/10 transition-colors" />
              <div className="relative">
                <div className="text-3xl mb-3">🔑</div>
                <h3 className="text-base font-bold text-ink mb-1.5">Your zip code is your credential.</h3>
                <p className="text-sm text-secondary leading-relaxed mb-4">
                  Verify your address. Join your neighborhood community. Drop takes on listings near you. Only real neighbors. No anonymous trolls.
                </p>
                <a href="/community/90026" className="inline-flex items-center gap-1 text-sm font-semibold text-amber hover:underline">
                  See a community in action
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── FOUNDER STORY — feels like a social post ── */}
          <div className="border border-divider rounded-2xl p-5 sm:p-6 mb-8 bg-gradient-to-br from-surface to-highlight relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shrink-0">ZK</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ink">Zachary Kaufman</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber/10 text-amber font-semibold">founder</span>
                  </div>
                  <p className="text-[11px] text-tertiary">Posted about why gwak gwak exists</p>
                </div>
              </div>
              <p className="text-[14px] text-ink/80 leading-relaxed mb-2">
                &ldquo;I bought my place and my neighbors immediately told me things my realtor never mentioned. Un-permitted additions. Flooding history. Neighbor disputes that went on for years.&rdquo;
              </p>
              <p className="text-[14px] text-ink font-semibold leading-relaxed">
                &ldquo;If gwak gwak existed, I would have had second thoughts. That&apos;s why I built it.&rdquo;
              </p>
            </div>
          </div>

          {/* ── HOW IT WORKS — 3 clear steps ── */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-bold text-ink mb-4">How gwak gwak works</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { emoji: "🏠", title: "Browse listings", desc: "Search any neighborhood", color: "bg-blue-50 border-blue-100" },
                { emoji: "💬", title: "Read the real talk", desc: "Comments from verified neighbors", color: "bg-amber-50 border-amber-100" },
                { emoji: "🗣️", title: "Drop your take", desc: "Verify your zip. Be heard.", color: "bg-green-50 border-green-100" },
              ].map((step, i) => (
                <div key={i} className={`${step.color} border rounded-2xl p-4 sm:p-5 text-center transition-all hover:shadow-soft`}>
                  <div className="text-3xl sm:text-4xl mb-2">{step.emoji}</div>
                  <p className="text-xs sm:text-sm font-bold text-ink mb-0.5">{step.title}</p>
                  <p className="text-[10px] sm:text-xs text-secondary leading-tight">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── EXPLORE CTAs — get them moving ── */}
          <div className="flex items-center gap-3 mb-10">
            <a href="/?sort=comments" className="flex-1 py-3.5 bg-ink text-white text-sm font-semibold rounded-xl text-center hover:opacity-90 transition-opacity">
              🔥 See trending listings
            </a>
            <a href="/imagine" className="flex-1 py-3.5 bg-surface border border-divider text-sm font-semibold text-ink rounded-xl text-center hover:bg-highlight transition-colors">
              🤖 AI Imagination
            </a>
          </div>
        </>
      )}

      {/* ====== SEARCH — when not on landing (filtered views) ====== */}
      {!isDefaultLanding && (
        <div className="mb-8">
          <Suspense>
            <SearchBar />
          </Suspense>
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
