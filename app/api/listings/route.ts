import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const city = searchParams.get("city") ?? undefined;
  const listingType = searchParams.get("type") as "sale" | "rent" | undefined;
  const propertyType = searchParams.get("propertyType") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const minBeds = searchParams.get("minBeds") ? Number(searchParams.get("minBeds")) : undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = 12;

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

  const where: Prisma.ListingWhereInput = { AND: conditions };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
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
        _count: { select: { comments: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json(
    { listings, total, page, perPage },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
