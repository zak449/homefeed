import { NextRequest, NextResponse } from "next/server";
import { fetchRealtorListings } from "@/lib/data-adapters/realtor";

/**
 * POST /api/listings/sync
 *
 * Triggers a data sync from Realty in US API (both sales + rentals)
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

  // Fetch sales and rentals in parallel
  const [saleCount, rentCount] = await Promise.all([
    fetchRealtorListings({ city, stateCode, listingType: "sale", limit: 20 }),
    fetchRealtorListings({ city, stateCode, listingType: "rent", limit: 20 }),
  ]);

  return NextResponse.json({
    synced: {
      sales: saleCount,
      rentals: rentCount,
      total: saleCount + rentCount,
    },
    city,
  });
}
