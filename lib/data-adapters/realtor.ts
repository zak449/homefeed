/**
 * Realty in US API adapter (via RapidAPI)
 * Handles: homes for sale AND rentals (single API for both)
 * Free tier: 500 requests/month
 *
 * Docs: https://rapidapi.com/apidojo/api/realty-in-us
 */

import { prisma } from "@/lib/prisma";

const API_HOST = process.env.REALTOR_API_HOST ?? "realty-in-us.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

type RealtyResult = {
  property_id: string;
  listing_id?: string;
  status: string;
  photo_count?: number;
  location?: {
    address?: {
      city?: string;
      line?: string;
      postal_code?: string;
      state_code?: string;
      state?: string;
      coordinate?: { lat?: number; lon?: number };
    };
    county?: { fips_code?: string };
  };
  description?: {
    type?: string;
    sub_type?: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    lot_sqft?: number;
    year_built?: number;
    text?: string;
    baths_full?: number;
    baths_half?: number;
  };
  advertisers?: {
    name?: string;
    email?: string;
    href?: string;
    type?: string;
    office?: { name?: string };
  }[];
  branding?: {
    name?: string;
    photo?: string;
    phone?: string;
  }[];
  source?: {
    agents?: {
      agent_name?: string;
      office_name?: string;
    }[];
  };
  primary_photo?: { href?: string };
  photos?: { href?: string }[];
  list_price?: number;
  list_price_min?: number;
  list_price_max?: number;
  price_reduced_amount?: number;
  href?: string;
  flags?: {
    is_new_listing?: boolean;
    is_price_reduced?: boolean;
    is_foreclosure?: boolean;
    is_pending?: boolean;
    is_contingent?: boolean;
  };
  last_update_date?: string;
  list_date?: string;
};

function mapPropertyType(raw?: string, subType?: string): string {
  const type = (subType || raw || "").toLowerCase();
  if (type.includes("single") || type.includes("house")) return "house";
  if (type.includes("condo")) return "condo";
  if (type.includes("town")) return "townhouse";
  if (type.includes("apartment") || type.includes("multi") || type.includes("duplex")) return "apartment";
  if (type.includes("land") || type.includes("lot")) return "house";
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

  const status = params.listingType === "rent"
    ? ["for_rent"]
    : ["for_sale", "ready_to_build"];

  const body: Record<string, unknown> = {
    limit: params.limit ?? 20,
    offset: 0,
    status,
    sort: { direction: "desc", field: "list_date" },
  };

  // Use city + state_code if we have both, otherwise just city
  if (params.stateCode) {
    body.city = params.city;
    body.state_code = params.stateCode;
  } else {
    // Try to extract state from "City, ST" format
    const parts = params.city.split(",").map((s) => s.trim());
    if (parts.length === 2 && parts[1].length === 2) {
      body.city = parts[0];
      body.state_code = parts[1].toUpperCase();
    } else {
      body.city = params.city;
    }
  }

  try {
    const res = await fetch(`https://${API_HOST}/properties/v3/list`, {
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
    const results: RealtyResult[] = json?.data?.home_search?.results ?? [];
    if (!Array.isArray(results)) return 0;

    let upserted = 0;

    for (const item of results) {
      const addr = item.location?.address;
      const price = item.list_price ?? item.list_price_max;
      if (!addr?.line || !addr?.city || !price) continue;

      // Get agent info from advertisers or branding
      const advertiser = item.advertisers?.[0];
      const brand = item.branding?.[0];
      const agentName = advertiser?.name ?? null;
      const agentEmail = advertiser?.email ?? null;
      const agentPhone = brand?.phone ?? null;
      const agentBrokerage = brand?.name ?? advertiser?.office?.name ?? item.source?.agents?.[0]?.office_name ?? null;

      // Collect photos — convert small thumbnails to large
      const photos: string[] = [];
      if (item.primary_photo?.href) {
        // Replace small 's.jpg' suffix with large 'od.jpg'
        photos.push(item.primary_photo.href.replace(/s\.jpg$/, "od.jpg"));
      }
      if (item.photos) {
        for (const p of item.photos) {
          if (p.href) {
            const url = p.href.replace(/s\.jpg$/, "od.jpg");
            if (!photos.includes(url)) photos.push(url);
          }
          if (photos.length >= 10) break;
        }
      }

      const neighborhood = null; // This API doesn't return neighborhood names in list

      try {
        await prisma.listing.upsert({
          where: { source_sourceId: { source: "realtor", sourceId: item.property_id } },
          update: {
            price: Math.round(price),
            status: item.flags?.is_pending ? "pending" : item.status === "sold" ? "sold" : "active",
            photos: photos.length > 0 ? photos : undefined,
            cachedAt: new Date(),
          },
          create: {
            source: "realtor",
            sourceId: item.property_id,
            status: item.flags?.is_pending ? "pending" : "active",
            address: addr.line,
            city: addr.city,
            state: addr.state_code ?? "",
            zip: addr.postal_code ?? "",
            neighborhood,
            latitude: addr.coordinate?.lat ?? null,
            longitude: addr.coordinate?.lon ?? null,
            price: Math.round(price),
            listingType: params.listingType === "rent" ? "rent" : "sale",
            propertyType: mapPropertyType(item.description?.type, item.description?.sub_type),
            bedrooms: item.description?.beds ?? null,
            bathrooms: item.description?.baths ?? null,
            sqft: item.description?.sqft ?? null,
            lotSqft: item.description?.lot_sqft ?? null,
            yearBuilt: item.description?.year_built ?? null,
            description: item.description?.text ?? null,
            photos,
            agentName,
            agentPhone,
            agentEmail,
            agentBrokerage,
            listingUrl: item.href ?? null,
            cachedAt: new Date(),
          },
        });
        upserted++;
      } catch (e) {
        console.error("[Realtor] Upsert error:", e);
      }
    }

    console.log(`[Realtor] Upserted ${upserted} ${params.listingType} listings for ${params.city}`);
    return upserted;
  } catch (e) {
    console.error("[Realtor] Fetch error:", e);
    return 0;
  }
}
