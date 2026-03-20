import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import GeoProvider from "@/components/GeoProvider";
import ListingFeed from "@/components/ListingFeed";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";

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

  // Lat/lng for radius search
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const radiusMiles = sp.radius ? Number(sp.radius) : 25;

  // Auto-sync: when a city is searched, fetch real API data if stale
  if (city) {
    try {
      await autoSyncCity(city);
    } catch (e) {
      console.error("[AutoSync] Error:", e);
    }
  }

  // Build where clause
  const conditions: Prisma.ListingWhereInput[] = [
    { status: "active" },
  ];

  if (city) {
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
          // Re-sort by price/sqft desc
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
        take: lat && lng ? 200 : perPage,
        select: selectFields,
      }),
      prisma.listing.count({ where }),
    ]);
  }

  // If lat/lng provided, sort by distance and filter to radius
  if (lat && lng) {
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
        distance: haversine(lat, lng, l.latitude!, l.longitude!),
      }))
      .filter((l) => l.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    const noCoords = listings.filter((l) => l.latitude == null || l.longitude == null);

    const all = [...withDistance, ...noCoords];
    total = all.length;
    listings = all.slice(0, perPage);
  }

  let sortedListings = listings;

  const hasMore = perPage < total;
  const hasFilters = !!(city || listingType || propertyType || minPrice || maxPrice || minBeds || minBaths || minSqft || maxSqft);

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

      {/* Header area */}
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-medium text-muted mb-1">
          {hasFilters
            ? `${total} listing${total !== 1 ? "s" : ""} found`
            : "what's happening on your block"}
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
              {city
                ? `${city}`
                : sort === "comments"
                  ? "🔥 Outrageous"
                  : "The Feed"
              }
            </h1>
            {/* For Sale / For Rent toggle */}
            <div className="flex items-center bg-tag rounded-full p-0.5">
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-ink shadow-sm"
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
          <div className="flex items-center gap-1.5 text-sm">
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
                  className={`px-3 py-1.5 rounded-full transition-colors font-medium ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-muted hover:bg-tag hover:text-ink"
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

      {/* Grid with infinite scroll */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="font-display text-lg font-bold text-ink mb-1">Nothing here yet</p>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Try a different city or remove some filters. Or just browse everything.
          </p>
          <a href="/" className="inline-block mt-5 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
            ← Back to all listings
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
