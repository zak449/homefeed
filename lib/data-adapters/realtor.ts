/**
 * Realtor Data API adapter (via RapidAPI)
 * Handles: homes for sale, recently sold
 * Free tier: 100 calls/month
 *
 * Docs: https://rapidapi.com/apidojo/api/realtor-com4
 */

import { prisma } from "@/lib/prisma";

const API_HOST = process.env.REALTOR_API_HOST ?? "realtor-com4.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

type RealtorResult = {
  property_id: string;
  list_price: number;
  list_price_max?: number;
  description?: {
    beds?: number;
    baths?: number;
    sqft?: number;
    lot_sqft?: number;
    year_built?: number;
    type?: string;
    text?: string;
  };
  location?: {
    address?: {
      line?: string;
      city?: string;
      state_code?: string;
      postal_code?: string;
      coordinate?: { lat?: number; lon?: number };
    };
    county?: { name?: string };
    neighborhoods?: { name?: string }[];
  };
  photos?: { href?: string }[];
  advertisers?: {
    name?: string;
    phone?: string;
    email?: string;
    photo?: { href?: string };
    office?: { name?: string };
  }[];
  status?: string;
  last_update_date?: string;
  permalink?: string;
};

function mapPropertyType(raw?: string): string {
  const lower = raw?.toLowerCase() ?? "";
  if (lower.includes("single") || lower.includes("house")) return "house";
  if (lower.includes("condo") || lower.includes("condos")) return "condo";
  if (lower.includes("town")) return "townhouse";
  if (lower.includes("apartment") || lower.includes("multi")) return "apartment";
  return "house";
}

export async function fetchRealtorListings(params: {
  city: string;
  stateCode?: string;
  listingType?: "sale" | "rent";
  limit?: number;
}): Promise<number> {
  if (!API_KEY) {
    console.warn("[Realtor] RAPIDAPI_KEY not set — skipping fetch");
    return 0;
  }

  const endpoint = params.listingType === "rent"
    ? "v2/for-rent"
    : "v2/for-sale";

  const body = {
    query: `${params.city}${params.stateCode ? `, ${params.stateCode}` : ""}`,
    limit: params.limit ?? 20,
    offset: 0,
    sort: { direction: "desc", field: "list_date" },
    status: ["for_sale"],
  };

  if (params.listingType === "rent") {
    body.status = ["for_rent"];
  }

  try {
    const res = await fetch(`https://${API_HOST}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[Realtor] API error: ${res.status} ${res.statusText}`);
      return 0;
    }

    const json = await res.json();
    const results: RealtorResult[] = json.data?.results ?? json.results ?? [];
    if (!Array.isArray(results)) return 0;

    let upserted = 0;

    for (const item of results) {
      const addr = item.location?.address;
      if (!addr?.line || !addr?.city || !item.list_price) continue;

      const agent = item.advertisers?.[0];
      const photos = (item.photos ?? [])
        .map((p) => p.href)
        .filter(Boolean)
        .slice(0, 10) as string[];

      const neighborhood = item.location?.neighborhoods?.[0]?.name ?? null;

      try {
        await prisma.listing.upsert({
          where: { source_sourceId: { source: "realtor", sourceId: item.property_id } },
          update: {
            price: Math.round(item.list_price),
            status: item.status === "sold" ? "sold" : "active",
            photos,
            cachedAt: new Date(),
          },
          create: {
            source: "realtor",
            sourceId: item.property_id,
            status: item.status === "sold" ? "sold" : "active",
            address: addr.line,
            city: addr.city,
            state: addr.state_code ?? "",
            zip: addr.postal_code ?? "",
            neighborhood,
            latitude: addr.coordinate?.lat ?? null,
            longitude: addr.coordinate?.lon ?? null,
            price: Math.round(item.list_price),
            listingType: params.listingType === "rent" ? "rent" : "sale",
            propertyType: mapPropertyType(item.description?.type),
            bedrooms: item.description?.beds ?? null,
            bathrooms: item.description?.baths ?? null,
            sqft: item.description?.sqft ?? null,
            lotSqft: item.description?.lot_sqft ?? null,
            yearBuilt: item.description?.year_built ?? null,
            description: item.description?.text ?? null,
            photos,
            agentName: agent?.name ?? null,
            agentPhone: agent?.phone ?? null,
            agentEmail: agent?.email ?? null,
            agentPhoto: agent?.photo?.href ?? null,
            agentBrokerage: agent?.office?.name ?? null,
            listingUrl: item.permalink
              ? `https://www.realtor.com/realestateandhomes-detail/${item.permalink}`
              : null,
            cachedAt: new Date(),
          },
        });
        upserted++;
      } catch (e) {
        console.error("[Realtor] Upsert error:", e);
      }
    }

    console.log(`[Realtor] Upserted ${upserted} listings for ${params.city}`);
    return upserted;
  } catch (e) {
    console.error("[Realtor] Fetch error:", e);
    return 0;
  }
}
