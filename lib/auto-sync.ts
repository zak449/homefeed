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

const API_HOST = process.env.REALTOR_API_HOST ?? "realty-in-us.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

/** Street-type keywords that indicate an address rather than a plain city name */
const ADDRESS_KEYWORDS = /\b(street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|road|rd|way|place|pl|circle|cir|terrace|ter|trail|trl|parkway|pkwy|highway|hwy)\b/i;

/**
 * Resolve a freeform search query into a normalized city + state using
 * the Realty API autocomplete endpoint. This handles cases like:
 * - "Floral park santa ana" → { city: "Santa Ana", state: "CA" }
 * - "brooklyn" → { city: "Brooklyn", state: "NY" }
 * - "90210" → { city: "Beverly Hills", state: "CA" }
 */
async function resolveViaAutocomplete(query: string): Promise<{ city: string; state?: string } | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `https://${API_HOST}/properties/v3/auto-complete?input=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const suggestions = json?.data?.autocomplete ?? [];

    // Look for city/neighborhood type results first
    for (const s of suggestions) {
      if (s.area_type === "city" || s.area_type === "neighborhood" || s.area_type === "postal_code") {
        const city = s.city ?? s._id?.split(",")[0]?.trim();
        const state = s.state_code;
        if (city) return { city, state };
      }
    }

    // Fall back to first result with city info
    for (const s of suggestions) {
      if (s.city) return { city: s.city, state: s.state_code };
    }

    return null;
  } catch (e) {
    console.error("[AutoSync] Autocomplete resolve error:", e);
    return null;
  }
}

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

  // Single segment — could be "Denver" or "Floral park santa ana" or a zip code
  // Check if it's a zip code
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return { city: trimmed };
  }

  return { city: trimmed };
}

export async function autoSyncCity(city: string, state?: string): Promise<void> {
  if (!API_KEY) return; // No API key, skip silently

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

  // If we don't have a state code, try to resolve via autocomplete first
  let resolvedCity = normalizedCity;
  let resolvedState = parsed.state;

  if (!resolvedState) {
    const resolved = await resolveViaAutocomplete(normalizedCity);
    if (resolved) {
      resolvedCity = resolved.city;
      resolvedState = resolved.state;
      console.log(`[AutoSync] Resolved "${normalizedCity}" → "${resolvedCity}, ${resolvedState}"`);
    }
  }

  // Fetch both sales and rentals from Realty in US API (40 each for good coverage)
  const [saleCount, rentCount] = await Promise.all([
    fetchRealtorListings({ city: resolvedCity, stateCode: resolvedState, listingType: "sale", limit: 40 }).catch(() => 0),
    fetchRealtorListings({ city: resolvedCity, stateCode: resolvedState, listingType: "rent", limit: 40 }).catch(() => 0),
  ]);

  // If we got 0 results and the user typed something different from what resolved,
  // also try with search_location as a fallback
  let fallbackSale = 0;
  let fallbackRent = 0;
  if (saleCount === 0 && rentCount === 0 && normalizedCity !== resolvedCity) {
    console.log(`[AutoSync] No results for resolved city, trying search_location fallback...`);
    [fallbackSale, fallbackRent] = await Promise.all([
      fetchRealtorListings({ city: normalizedCity, listingType: "sale", limit: 40, useSearchLocation: true }).catch(() => 0),
      fetchRealtorListings({ city: normalizedCity, listingType: "rent", limit: 40, useSearchLocation: true }).catch(() => 0),
    ]);
  }

  const totalSale = saleCount + fallbackSale;
  const totalRent = rentCount + fallbackRent;

  // Record the sync — use the resolved city if we got results, otherwise the original
  const syncCity = (totalSale + totalRent > 0 && resolvedCity) ? resolvedCity.toLowerCase() : normalizedCity.toLowerCase();
  const syncState = (totalSale + totalRent > 0 && resolvedState) ? resolvedState : stateKey;

  await prisma.citySync.upsert({
    where: { city_state: { city: syncCity, state: syncState } },
    update: { lastSync: new Date(), realtorCount: totalSale + totalRent },
    create: { city: syncCity, state: syncState, realtorCount: totalSale + totalRent },
  });

  // Also record the original query so we don't re-sync on identical searches
  if (syncCity !== normalizedCity.toLowerCase() || syncState !== stateKey) {
    await prisma.citySync.upsert({
      where: { city_state: { city: normalizedCity.toLowerCase(), state: stateKey } },
      update: { lastSync: new Date(), realtorCount: totalSale + totalRent },
      create: { city: normalizedCity.toLowerCase(), state: stateKey, realtorCount: totalSale + totalRent },
    });
  }

  console.log(`[AutoSync] ${normalizedCity}: ${totalSale} for sale + ${totalRent} for rent`);
}
