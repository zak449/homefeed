import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { enrichBatch } from "@/lib/enrich-batch";
import { fetchRealtorListings } from "@/lib/data-adapters/realtor";
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const city = searchParams.get("city") ?? undefined;
  const listingType = searchParams.get("type") as "sale" | "rent" | undefined;
  const propertyType = searchParams.get("propertyType") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const minBeds = searchParams.get("minBeds") ? Number(searchParams.get("minBeds")) : undefined;
  const minBaths = searchParams.get("minBaths") ? Number(searchParams.get("minBaths")) : undefined;
  const minSqft = searchParams.get("minSqft") ? Number(searchParams.get("minSqft")) : undefined;
  const maxSqft = searchParams.get("maxSqft") ? Number(searchParams.get("maxSqft")) : undefined;
  const sort = searchParams.get("sort") ?? "newest";
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = 12;

  // Lat/lng for radius search
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;
  const radiusMiles = searchParams.get("radius") ? Number(searchParams.get("radius")) : 25;
  const isGeoSearch = lat !== undefined && lng !== undefined;

  // Numeric validation
  if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) {
    return NextResponse.json({ error: "Invalid parameter: minPrice" }, { status: 400 });
  }
  if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
    return NextResponse.json({ error: "Invalid parameter: maxPrice" }, { status: 400 });
  }
  if (minBeds !== undefined && (isNaN(minBeds) || minBeds < 0)) {
    return NextResponse.json({ error: "Invalid parameter: minBeds" }, { status: 400 });
  }
  if (minBaths !== undefined && (isNaN(minBaths) || minBaths < 0)) {
    return NextResponse.json({ error: "Invalid parameter: minBaths" }, { status: 400 });
  }
  if (minSqft !== undefined && (isNaN(minSqft) || minSqft < 0)) {
    return NextResponse.json({ error: "Invalid parameter: minSqft" }, { status: 400 });
  }
  if (maxSqft !== undefined && (isNaN(maxSqft) || maxSqft < 0)) {
    return NextResponse.json({ error: "Invalid parameter: maxSqft" }, { status: 400 });
  }
  if (isGeoSearch && (isNaN(radiusMiles) || radiusMiles <= 0 || radiusMiles > 100)) {
    return NextResponse.json({ error: "Invalid parameter: radiusMiles" }, { status: 400 });
  }

  // Build filters — always filter to active listings only
  const conditions: Prisma.ListingWhereInput[] = [
    { status: "active" },
  ];

  // Skip city text filter when doing geo search — haversine handles proximity
  if (city && !isGeoSearch) {
    const words = city.split(/[\s,]+/).filter(w => w.length > 1);
    conditions.push({
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
        { address: { contains: city, mode: "insensitive" } },
        // Word-by-word matching for multi-word queries
        ...(words.length >= 2 ? [{
          AND: words.map(word => ({
            OR: [
              { city: { contains: word, mode: "insensitive" as const } },
              { neighborhood: { contains: word, mode: "insensitive" as const } },
              { address: { contains: word, mode: "insensitive" as const } },
            ],
          })),
        }] : []),
        // Individual word matches on city
        ...words.filter(w => w.length > 2).map(word => ({
          city: { contains: word, mode: "insensitive" as const },
        })),
      ],
    });
  }

  if (q) {
    conditions.push({
      OR: [
        { address: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
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
  if (sort === "price-low") orderBy = { price: "asc" };
  if (sort === "price-high") orderBy = { price: "desc" };

  const selectFields = {
    id: true,
    address: true,
    city: true,
    state: true,
    neighborhood: true,
    price: true,
    listingType: true,
    propertyType: true,
    status: true,
    bedrooms: true,
    bathrooms: true,
    sqft: true,
    photos: true,
    agentName: true,
    agentPhone: true,
    createdAt: true,
    latitude: true,
    longitude: true,
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
    // "Hot Takes" / Outrageous: most expensive + worst price-per-sqft, interleaved
    const takeCount = page * perPage;
    const [expensive, worstDeal, count] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { price: "desc" },
        skip: 0,
        take: takeCount,
        select: selectFields,
      }),
      prisma.$queryRaw`
        SELECT id FROM "Listing"
        WHERE sqft IS NOT NULL AND sqft > 0 AND status = 'active'
        ORDER BY (price::float / sqft::float) DESC
        LIMIT ${takeCount}
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
    while (interleaved.length < takeCount && (ei < expensive.length || wi < worstDeal.length)) {
      if (ei < expensive.length) {
        if (!seen.has(expensive[ei].id)) {
          seen.add(expensive[ei].id);
          interleaved.push(expensive[ei]);
        }
        ei++;
      }
      if (interleaved.length >= takeCount) break;
      if (wi < worstDeal.length) {
        if (!seen.has(worstDeal[wi].id)) {
          seen.add(worstDeal[wi].id);
          interleaved.push(worstDeal[wi]);
        }
        wi++;
      }
    }

    listings = interleaved.slice((page - 1) * perPage, page * perPage);
    total = count;
  } else if (isGeoSearch) {
    // For geo search, fetch all matching listings (no skip/take) so haversine
    // filtering sees every candidate. Pagination happens after filtering.
    listings = await prisma.listing.findMany({
      where,
      orderBy,
      select: selectFields,
    });
    total = 0; // will be set after geo filtering below
  } else {
    [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
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
        distance: haversine(lat, lng, l.latitude!, l.longitude!),
      }))
      .filter((l) => l.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    const noCoords = listings.filter((l) => l.latitude == null || l.longitude == null);

    const all = [...withDistance, ...noCoords];
    total = all.length;
    listings = all.slice((page - 1) * perPage, page * perPage);
  }

  // ── Auto-sync: if city search returned 0 results, fetch from Realtor API ──
  if (city && total === 0 && listings.length === 0 && !isGeoSearch && page === 1) {
    try {
      // Parse state code from city string (e.g. "Beaumont, CA" → stateCode "CA")
      const parts = city.split(",").map(s => s.trim());
      const cityName = parts[0];
      const stateCode = parts[1]?.length === 2 ? parts[1].toUpperCase() : undefined;

      const [saleCount, rentCount] = await Promise.all([
        fetchRealtorListings({ city: cityName, stateCode, listingType: "sale", limit: 20 }),
        fetchRealtorListings({ city: cityName, stateCode, listingType: "rent", limit: 20 }),
      ]);

      if (saleCount + rentCount > 0) {
        // Re-query now that we have data
        const freshListings = await prisma.listing.findMany({
          where,
          orderBy,
          skip: 0,
          take: perPage,
          select: selectFields,
        });
        const freshTotal = await prisma.listing.count({ where });

        const freshWithComments = freshListings.map((l) => ({
          ...l,
          topComment: l.comments?.[0] ?? null,
        }));

        return NextResponse.json(
          { listings: freshWithComments, hasMore: freshTotal > perPage, total: freshTotal, synced: saleCount + rentCount },
          { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
        );
      }
    } catch (e) {
      console.error("[Auto-sync] Error fetching listings for", city, e);
    }
  }

  const hasMore = page * perPage < total;

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

  // Deduplicate (word-match OR queries can return duplicates)
  const seenIds = new Set<string>();
  const uniqueListings = listings.filter((l) => {
    if (seenIds.has(l.id)) return false;
    seenIds.add(l.id);
    return true;
  });

  // Map listings to include topComment for the social layer
  const withComments = uniqueListings.map((l) => ({
    ...l,
    topComment: l.comments?.[0] ?? null,
  }));

  return NextResponse.json(
    { listings: withComments, hasMore, total },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
