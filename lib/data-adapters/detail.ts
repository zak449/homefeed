/**
 * Fetch full property details (photos, description, year_built)
 * from the Realty in US API detail endpoint.
 *
 * Called when a user views a listing that came from the API
 * and doesn't have full data yet.
 */

import { prisma } from "@/lib/prisma";

const API_HOST = process.env.REALTOR_API_HOST ?? "realty-in-us.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

export async function enrichListingDetail(listingId: string): Promise<void> {
  if (!API_KEY) return;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { source: true, sourceId: true, description: true, photos: true, yearBuilt: true },
  });

  if (!listing || listing.source !== "realtor") return;

  // Skip if we already have description + multiple photos (already enriched)
  if (listing.description && listing.photos.length > 2) return;

  try {
    const res = await fetch(
      `https://${API_HOST}/properties/v3/detail?property_id=${listing.sourceId}`,
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
      }
    );

    if (!res.ok) {
      console.error(`[Detail] API error: ${res.status}`);
      return;
    }

    const json = await res.json();
    const home = json?.data?.home;
    if (!home) return;

    // Extract photos (full size — replace 's.jpg' with 'od.jpg' for larger images)
    const photos: string[] = [];
    if (Array.isArray(home.photos)) {
      for (const p of home.photos) {
        if (p?.href) {
          // Convert small thumbnail to large: replace suffix before .jpg
          const fullSize = p.href.replace(/s\.jpg$/, "od.jpg");
          photos.push(fullSize);
          if (photos.length >= 20) break;
        }
      }
    }

    // Extract description
    const description = home.description?.text || null;
    const yearBuilt = home.description?.year_built || null;
    const sqft = home.description?.sqft || null;
    const lotSqft = home.description?.lot_sqft || null;
    const parking = home.garage ? `${home.garage} car garage` : null;

    // Update listing with enriched data
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...(photos.length > 0 && { photos }),
        ...(description && { description }),
        ...(yearBuilt && { yearBuilt }),
        ...(sqft && { sqft }),
        ...(lotSqft && { lotSqft }),
        ...(parking && { parking }),
      },
    });

    console.log(`[Detail] Enriched ${listing.sourceId}: ${photos.length} photos, desc: ${!!description}`);
  } catch (e) {
    console.error("[Detail] Fetch error:", e);
  }
}
