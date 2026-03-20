/**
 * Data adapter entry point.
 *
 * Two real API adapters:
 *   - RentCast (via RapidAPI): rental listings
 *   - Realtor Data API (via RapidAPI): homes for sale
 *
 * Both share a single RAPIDAPI_KEY env var.
 * When RAPIDAPI_KEY is not set, listings are served
 * entirely from the Postgres cache / seed data.
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

export { fetchRentCastListings } from "./rentcast";
export { fetchRealtorListings } from "./realtor";
