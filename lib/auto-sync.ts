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

/** Street-type keywords that indicate an address rather than a plain city name */
const ADDRESS_KEYWORDS = /\b(street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|road|rd|way|place|pl|circle|cir|terrace|ter|trail|trl|parkway|pkwy|highway|hwy)\b/i;

/**
 * Parse a search query and extract a city (and optional state) suitable for
 * the Realty in US API.  Handles:
 *   - "City, ST" or "City, State"  → { city, state }
 *   - Full addresses like "1234 Main St, Denver, CO 80202"
 *     → extracts the city portion ("Denver") and state ("CO")
 *   - Plain city names → returned as-is
 */
export function parseSearchQuery(raw: string): { city: string; state?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { city: "" };

  // Split on commas to inspect parts
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    // Last part may be "ST", "ST 12345", or a full state name
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/^([A-Za-z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/);

    if (stateZipMatch) {
      const stateCode = stateZipMatch[1].toUpperCase();
      // The city is the second-to-last part (skip leading street portions)
      const cityPart = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
      // Strip any leading street number / street-type words if it looks like an address
      const cleaned = cityPart.replace(/^\d+\s+/, "").trim();
      // If the cleaned result still looks like a street name, use it anyway —
      // but prefer the segment that is NOT the street line
      if (parts.length >= 3) {
        return { city: parts[parts.length - 2], state: stateCode };
      }
      return { city: cleaned, state: stateCode };
    }

    // No state code detected — maybe "City, Neighborhood" or similar.
    // Just use the first meaningful segment.
    return { city: parts[0] };
  }

  // Single segment — could be "Denver" or "1234 Main St"
  // If it starts with a number or contains address keywords, it's likely an address
  // without a city.  Not much we can extract for an API call, so return as-is.
  return { city: trimmed };
}

export async function autoSyncCity(city: string, state?: string): Promise<void> {
  if (!process.env.RAPIDAPI_KEY) return; // No API key, skip silently

  // Parse the query to extract a usable city/state for the API
  const parsed = parseSearchQuery(city);
  if (state) parsed.state = state.toUpperCase();

  const normalizedCity = parsed.city.trim();
  if (!normalizedCity) return;

  const stateKey = parsed.state?.toUpperCase() ?? "";

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

  // Fetch both sales and rentals from Realty in US API (40 each for good coverage)
  const [saleCount, rentCount] = await Promise.all([
    fetchRealtorListings({ city: normalizedCity, stateCode: parsed.state, listingType: "sale", limit: 40 }).catch(() => 0),
    fetchRealtorListings({ city: normalizedCity, stateCode: parsed.state, listingType: "rent", limit: 40 }).catch(() => 0),
  ]);

  // Record the sync
  await prisma.citySync.upsert({
    where: { city_state: { city: normalizedCity.toLowerCase(), state: stateKey } },
    update: { lastSync: new Date(), realtorCount: saleCount + rentCount },
    create: { city: normalizedCity.toLowerCase(), state: stateKey, realtorCount: saleCount + rentCount },
  });

  console.log(`[AutoSync] ${normalizedCity}: ${saleCount} for sale + ${rentCount} for rent`);
}
