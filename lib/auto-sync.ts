/**
 * Auto-sync: fetch real listings from APIs when a city is searched
 * and we don't have fresh data (or any data at all).
 *
 * Uses "Realty in US" API via RapidAPI for both sales AND rentals.
 * Respects rate limits by tracking last sync per city in the DB.
 * Stale threshold: 24 hours.
 */

import { prisma } from "@/lib/prisma";
import { fetchRealtorListings } from "@/lib/data-adapters/realtor";

const STALE_HOURS = 24;

export async function autoSyncCity(city: string, state?: string): Promise<void> {
  if (!process.env.RAPIDAPI_KEY) return; // No API key, skip silently

  const normalizedCity = city.trim();
  if (!normalizedCity) return;

  const stateKey = state?.toUpperCase() ?? "";

  // Check if we've synced this city recently
  const existing = await prisma.citySync.findUnique({
    where: { city_state: { city: normalizedCity.toLowerCase(), state: stateKey } },
  });

  if (existing) {
    const hoursSinceSync = (Date.now() - existing.lastSync.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSync < STALE_HOURS) {
      console.log(`[AutoSync] ${normalizedCity} synced ${hoursSinceSync.toFixed(1)}h ago — skipping`);
      return;
    }
  }

  console.log(`[AutoSync] Fetching fresh data for ${normalizedCity}...`);

  // Fetch both sales and rentals from Realty in US API
  const [saleCount, rentCount] = await Promise.all([
    fetchRealtorListings({ city: normalizedCity, stateCode: state, listingType: "sale", limit: 20 }).catch(() => 0),
    fetchRealtorListings({ city: normalizedCity, stateCode: state, listingType: "rent", limit: 20 }).catch(() => 0),
  ]);

  // Record the sync
  await prisma.citySync.upsert({
    where: { city_state: { city: normalizedCity.toLowerCase(), state: stateKey } },
    update: { lastSync: new Date(), realtorCount: saleCount + rentCount },
    create: { city: normalizedCity.toLowerCase(), state: stateKey, realtorCount: saleCount + rentCount },
  });

  console.log(`[AutoSync] ${normalizedCity}: ${saleCount} for sale + ${rentCount} for rent`);
}
