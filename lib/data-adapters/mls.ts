/**
 * MLS / RESO Web API adapter (Spark API gateway)
 *
 * Prerequisites:
 *  1. Obtain IDX credentials from your local MLS board
 *  2. Spark API (https://sparkplatform.com) is a common gateway that translates
 *     RETS / RESO Web API into a clean REST interface
 *  3. Set MLS_API_URL and MLS_API_KEY in your .env
 *
 * Docs: https://sparkplatform.com/docs/api_services/reso_web_api
 */

import { prisma } from "@/lib/prisma";

type SparkListing = {
  Id: string;
  StandardFields: {
    UnparsedAddress: string;
    City: string;
    StateOrProvince: string;
    PostalCode: string;
    ListPrice: number;
    PropertyType: string;
    BedsTotal?: number;
    BathsTotal?: number;
    BuildingAreaTotal?: number;
    LotSizeArea?: number;
    YearBuilt?: number;
    PublicRemarks?: string;
    Photos?: { Uri800: string }[];
    ListAgentName?: string;
    ListAgentPreferredPhone?: string;
    ListAgentEmail?: string;
    ListOfficeName?: string;
    MlsStatus?: string;
  };
};

export async function fetchMlsListings(city: string): Promise<void> {
  const apiUrl = process.env.MLS_API_URL;
  const apiKey = process.env.MLS_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn("[mls] Missing MLS_API_URL or MLS_API_KEY — skipping");
    return;
  }

  const params = new URLSearchParams({
    _filter: `City eq '${city}'`,
    _limit: "50",
    _expand: "Photos",
  });

  const res = await fetch(`${apiUrl}?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.error("[mls] API error", res.status, await res.text());
    return;
  }

  const json = await res.json();
  const listings: SparkListing[] = json.D?.Results ?? [];

  for (const l of listings) {
    const sf = l.StandardFields;
    await prisma.listing.upsert({
      where: { source_sourceId: { source: "mls", sourceId: l.Id } },
      update: mapSparkListing(l.Id, sf),
      create: mapSparkListing(l.Id, sf),
    });
  }

  console.log(`[mls] Upserted ${listings.length} listings for ${city}`);
}

function mapSparkListing(id: string, sf: SparkListing["StandardFields"]) {
  const isRent = (sf.MlsStatus ?? "").toLowerCase().includes("lease");
  return {
    source: "mls",
    sourceId: id,
    address: sf.UnparsedAddress ?? "",
    city: sf.City ?? "",
    state: sf.StateOrProvince ?? "",
    zip: sf.PostalCode ?? "",
    price: sf.ListPrice ?? 0,
    listingType: isRent ? "rent" : "sale",
    propertyType: normalizePropertyType(sf.PropertyType),
    bedrooms: sf.BedsTotal ?? null,
    bathrooms: sf.BathsTotal ?? null,
    sqft: sf.BuildingAreaTotal ? Math.round(sf.BuildingAreaTotal) : null,
    lotSqft: sf.LotSizeArea ? Math.round(sf.LotSizeArea * 43560) : null, // acres → sqft
    yearBuilt: sf.YearBuilt ?? null,
    description: sf.PublicRemarks ?? null,
    photos: (sf.Photos ?? []).slice(0, 8).map((p) => p.Uri800),
    agentName: sf.ListAgentName ?? null,
    agentPhone: sf.ListAgentPreferredPhone ?? null,
    agentEmail: sf.ListAgentEmail ?? null,
    agentBrokerage: sf.ListOfficeName ?? null,
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
