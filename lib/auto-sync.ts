/**
 * Auto-sync: fetch real listings from APIs when a city is searched
 * and we don't have fresh data (or any data at all).
 *
 * Respects rate limits by tracking last sync per city in the DB.
 * Stale threshold: 24 hours.
 */

import { prisma } from "@/lib/prisma";
import { fetchRentCastListings } from "@/lib/data-adapters/rentcast";
import { fetchRealtorListings } from "@/lib/data-adapters/realtor";

const STALE_HOURS = 24;

export async function autoSyncCity(city: string, state?: string): Promise<void> {
  if (!process.env.RAPIDAPI_KEY) return; // No API key, skip silently

  const normalizedCity = city.trim();
  if (!normalizedCity) return;

  // Check if we've synced this city recently
  const existing = await prisma.citySync.findUnique({
    where: { city_state: { city: normalizedCity.toLowerCase(), state: state?.toUpperCase() ?? "" } },
  });

  if (existing) {
    const hoursSinceSync = (Date.now() - existing.lastSync.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSync < STALE_HOURS) {
      console.log(`[AutoSync] ${normalizedCity} synced ${hoursSinceSync.toFixed(1)}h ago — skipping`);
      return;
    }
  }

  console.log(`[AutoSync] Fetching fresh data for ${normalizedCity}...`);

  // Fetch from both APIs in parallel
  const [rentcastCount, realtorCount] = await Promise.all([
    fetchRentCastListings({ city: normalizedCity, state, listingType: "rent", limit: 20 }).catch(() => 0),
    fetchRealtorListings({ city: normalizedCity, stateCode: state, listingType: "sale", limit: 20 }).catch(() => 0),
  ]);

  // Record the sync
  await prisma.citySync.upsert({
    where: { city_state: { city: normalizedCity.toLowerCase(), state: state?.toUpperCase() ?? "" } },
    update: { lastSync: new Date(), rentcastCount, realtorCount },
    create: { city: normalizedCity.toLowerCase(), state: state?.toUpperCase() ?? "", rentcastCount, realtorCount },
  });

  console.log(`[AutoSync] ${normalizedCity}: ${rentcastCount} rentals + ${realtorCount} sales`);
}
