import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { autoSyncCity } from "@/lib/auto-sync";

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

  // Auto-sync city data from real APIs if stale
  if (city) {
    try {
      await autoSyncCity(city);
    } catch (e) {
      console.error("[Listings API] AutoSync error:", e);
    }
  }

  // Build filters — always filter to active listings only
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

  let [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: sort === "comments" ? { createdAt: "desc" } : orderBy,
      skip: (page - 1) * perPage,
      take: sort === "comments" ? 200 : (lat && lng ? 200 : perPage),
      select: {
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
        _count: { select: { comments: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

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
    listings = all.slice((page - 1) * perPage, page * perPage);
  }

  // If sorting by comments, sort and paginate in memory
  if (sort === "comments") {
    const sorted = [...listings].sort(
      (a, b) => (b._count?.comments ?? 0) - (a._count?.comments ?? 0)
    );
    listings = sorted.slice((page - 1) * perPage, page * perPage);
  }

  const hasMore = page * perPage < total;

  return NextResponse.json(
    { listings, hasMore, total },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
