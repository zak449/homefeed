/**
 * RentCast API adapter (via RapidAPI)
 * Handles: rental listings
 * Free tier: 50 calls/month
 *
 * Docs: https://rapidapi.com/realtyfeed-realtyfeed-default/api/rentcast1
 */

import { prisma } from "@/lib/prisma";

const API_HOST = process.env.RENTCAST_API_HOST ?? "rentcast.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

type RentCastListing = {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize: number;
  yearBuilt: number;
  price: number;
  listingType: string;
  status: string;
  daysOnMarket: number;
  listedDate: string;
  lastSeenDate: string;
  removedDate: string | null;
  createdDate: string;
  publishedDate: string;
};

function mapPropertyType(raw: string): string {
  const lower = raw?.toLowerCase() ?? "";
  if (lower.includes("single") || lower.includes("house")) return "house";
  if (lower.includes("condo")) return "condo";
  if (lower.includes("town")) return "townhouse";
  if (lower.includes("apartment") || lower.includes("multi")) return "apartment";
  return "house";
}

export async function fetchRentCastListings(params: {
  city: string;
  state?: string;
  listingType?: "sale" | "rent";
  limit?: number;
}): Promise<number> {
  if (!API_KEY) {
    console.warn("[RentCast] RAPIDAPI_KEY not set — skipping fetch");
    return 0;
  }

  const searchParams = new URLSearchParams({
    city: params.city,
    ...(params.state && { state: params.state }),
    status: "active",
    limit: String(params.limit ?? 20),
  });

  const endpoint = params.listingType === "rent"
    ? "listings/rental/long-term"
    : "listings/sale";

  try {
    const res = await fetch(`https://${API_HOST}/v1/${endpoint}?${searchParams}`, {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
    });

    if (!res.ok) {
      console.error(`[RentCast] API error: ${res.status} ${res.statusText}`);
      return 0;
    }

    const data: RentCastListing[] = await res.json();
    if (!Array.isArray(data)) return 0;

    let upserted = 0;

    for (const item of data) {
      try {
        await prisma.listing.upsert({
          where: { source_sourceId: { source: "rentcast", sourceId: item.id } },
          update: {
            price: Math.round(item.price),
            status: item.removedDate ? "off_market" : "active",
            cachedAt: new Date(),
          },
          create: {
            source: "rentcast",
            sourceId: item.id,
            status: item.removedDate ? "off_market" : "active",
            address: item.addressLine1 ?? item.formattedAddress,
            city: item.city,
            state: item.state,
            zip: item.zipCode,
            latitude: item.latitude,
            longitude: item.longitude,
            price: Math.round(item.price),
            listingType: params.listingType === "rent" ? "rent" : "sale",
            propertyType: mapPropertyType(item.propertyType),
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            sqft: item.squareFootage,
            lotSqft: item.lotSize,
            yearBuilt: item.yearBuilt,
            photos: [],
            cachedAt: new Date(),
          },
        });
        upserted++;
      } catch (e) {
        console.error("[RentCast] Upsert error:", e);
      }
    }

    console.log(`[RentCast] Upserted ${upserted} listings for ${params.city}`);
    return upserted;
  } catch (e) {
    console.error("[RentCast] Fetch error:", e);
    return 0;
  }
}
