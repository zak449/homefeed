/**
 * Data adapter entry point.
 *
 * When USE_LIVE_DATA=true and the relevant API keys are set,
 * this module calls real Zillow / MLS APIs and upserts results
 * into the local Postgres cache.
 *
 * Otherwise, listings are served entirely from the Postgres cache
 * which was pre-seeded with demo data.
 */

export type ListingFilters = {
  city?: string;
  listingType?: "sale" | "rent";
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  q?: string;
};

// Re-export adapters for use in admin/sync routes
export { fetchZillowListings } from "./zillow";
export { fetchMlsListings } from "./mls";
