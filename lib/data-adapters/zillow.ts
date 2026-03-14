/**
 * Zillow Bridge Interactive API adapter
 *
 * Prerequisites:
 *  1. Apply for Bridge Interactive access at https://bridgeinteractive.com
 *  2. Set ZILLOW_API_KEY and ZILLOW_DATASET_ID in your .env
 *
 * Docs: https://bridgedataoutput.com/docs/explorer/
 */

import { prisma } from "@/lib/prisma";

type BridgeListing = {
  ListingKey: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  SubdivisionName?: string;
  ListPrice: number;
  StandardStatus: string;
  PropertyType: string;
  BedroomsTotal?: number;
  BathroomsTotalDecimal?: number;
  LivingArea?: number;
  LotSizeSquareFeet?: number;
  YearBuilt?: number;
  ParkingTotal?: number;
  PublicRemarks?: string;
  Media?: { MediaURL: string }[];
  ListAgentFullName?: string;
  ListAgentDirectPhone?: string;
  ListAgentEmail?: string;
  ListOfficeName?: string;
};

export async function fetchZillowListings(city: string): Promise<void> {
  const apiKey = process.env.ZILLOW_API_KEY;
  const datasetId = process.env.ZILLOW_DATASET_ID;

  if (!apiKey || !datasetId) {
    console.warn("[zillow] Missing ZILLOW_API_KEY or ZILLOW_DATASET_ID — skipping");
    return;
  }

  const url = `${process.env.ZILLOW_API_BASE_URL}/datasets/${datasetId}/listings?access_token=${apiKey}&fields=ListingKey,UnparsedAddress,City,StateOrProvince,PostalCode,ListPrice,PropertyType,BedroomsTotal,BathroomsTotalDecimal,LivingArea,LotSizeSquareFeet,YearBuilt,PublicRemarks,Media,ListAgentFullName,ListAgentDirectPhone,ListAgentEmail,ListOfficeName&where=City eq '${city}'&limit=50`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("[zillow] API error", res.status, await res.text());
    return;
  }

  const json = await res.json();
  const listings: BridgeListing[] = json.bundle ?? [];

  for (const l of listings) {
    await prisma.listing.upsert({
      where: { source_sourceId: { source: "zillow", sourceId: l.ListingKey } },
      update: mapBridgeListing(l),
      create: mapBridgeListing(l),
    });
  }

  console.log(`[zillow] Upserted ${listings.length} listings for ${city}`);
}

function mapBridgeListing(l: BridgeListing) {
  const isRent = l.StandardStatus?.toLowerCase().includes("lease");
  return {
    source: "zillow",
    sourceId: l.ListingKey,
    address: l.UnparsedAddress ?? "",
    city: l.City ?? "",
    state: l.StateOrProvince ?? "",
    zip: l.PostalCode ?? "",
    neighborhood: l.SubdivisionName ?? null,
    price: l.ListPrice ?? 0,
    listingType: isRent ? "rent" : "sale",
    propertyType: normalizePropertyType(l.PropertyType),
    bedrooms: l.BedroomsTotal ?? null,
    bathrooms: l.BathroomsTotalDecimal ?? null,
    sqft: l.LivingArea ?? null,
    lotSqft: l.LotSizeSquareFeet ? Math.round(l.LotSizeSquareFeet) : null,
    yearBuilt: l.YearBuilt ?? null,
    parking: l.ParkingTotal ? `${l.ParkingTotal} spot(s)` : null,
    description: l.PublicRemarks ?? null,
    photos: (l.Media ?? []).slice(0, 8).map((m) => m.MediaURL),
    agentName: l.ListAgentFullName ?? null,
    agentPhone: l.ListAgentDirectPhone ?? null,
    agentEmail: l.ListAgentEmail ?? null,
    agentBrokerage: l.ListOfficeName ?? null,
    listingUrl: null,
  };
}

function normalizePropertyType(raw?: string): string {
  const t = (raw ?? "").toLowerCase();
  if (t.includes("condo")) return "condo";
  if (t.includes("townhouse") || t.includes("townhome")) return "townhouse";
  if (t.includes("apartment") || t.includes("multi")) return "apartment";
  return "house";
}
