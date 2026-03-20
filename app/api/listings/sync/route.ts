import { NextRequest, NextResponse } from "next/server";
import { fetchRentCastListings } from "@/lib/data-adapters/rentcast";
import { fetchRealtorListings } from "@/lib/data-adapters/realtor";

/**
 * POST /api/listings/sync
 *
 * Triggers a data sync from RentCast (rentals) and Realtor (sales)
 * for a given city. Protected by API key.
 *
 * Body: { city: string, stateCode?: string }
 */
export async function POST(req: NextRequest) {
  // Simple auth check
  const authKey = req.headers.get("x-api-key");
  if (authKey !== process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const city = body?.city;
  if (!city || typeof city !== "string") {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  const stateCode = body?.stateCode;

  // Fetch from both sources in parallel
  const [rentcastCount, realtorCount] = await Promise.all([
    fetchRentCastListings({ city, state: stateCode, listingType: "rent", limit: 20 }),
    fetchRealtorListings({ city, stateCode, listingType: "sale", limit: 20 }),
  ]);

  return NextResponse.json({
    synced: {
      rentcast: rentcastCount,
      realtor: realtorCount,
      total: rentcastCount + realtorCount,
    },
    city,
  });
}
