/**
 * Address Lookup API — searches for ANY property by address
 * Uses the Realty in US API to find properties that may not be actively listed
 * Returns property data even for off-market homes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const API_HOST = process.env.REALTOR_API_HOST ?? "realty-in-us.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const searchText = query.trim();

  // 1. First check if we already have this in our DB (any status)
  const dbResults = await prisma.listing.findMany({
    where: {
      OR: [
        { address: { contains: searchText, mode: "insensitive" } },
        {
          AND: searchText.split(/\s+/).filter(w => w.length > 2).map(word => ({
            address: { contains: word, mode: "insensitive" as const },
          })),
        },
      ],
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, address: true, city: true, state: true, zip: true,
      price: true, listingType: true, status: true, photos: true,
      bedrooms: true, bathrooms: true, sqft: true, propertyType: true,
    },
  });

  if (dbResults.length > 0) {
    return NextResponse.json({ results: dbResults, source: "db" });
  }

  // 2. Not in DB — call the Realty API to look it up
  if (!API_KEY) {
    return NextResponse.json({ results: [], source: "none" });
  }

  try {
    // Use the auto-complete endpoint for address search
    const autoRes = await fetch(
      `https://${API_HOST}/properties/v3/auto-complete?input=${encodeURIComponent(searchText)}&limit=5`,
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
      }
    );

    if (!autoRes.ok) {
      console.error(`[AddressLookup] Auto-complete error: ${autoRes.status}`);
      return NextResponse.json({ results: [], source: "api_error" });
    }

    const autoJson = await autoRes.json();
    const suggestions = autoJson?.data?.autocomplete ?? [];

    // Find address-type results (not cities)
    const addressResults = suggestions.filter(
      (s: any) => s._id && (s.area_type === "address" || s.full_address)
    );

    if (addressResults.length === 0) {
      // Try searching with the list endpoint using location text
      return await searchByLocation(searchText);
    }

    // Look up the first address match
    const firstMatch = addressResults[0];
    const propertyId = firstMatch._id;

    // Fetch full property details
    const detailRes = await fetch(
      `https://${API_HOST}/properties/v3/detail?property_id=${propertyId}`,
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
      }
    );

    if (!detailRes.ok) {
      return NextResponse.json({ results: [], source: "api_error" });
    }

    const detailJson = await detailRes.json();
    const home = detailJson?.data?.home;
    if (!home) {
      return NextResponse.json({ results: [], source: "not_found" });
    }

    // Determine if it's actively listed
    const isForSale = home.status === "for_sale" || home.status === "ready_to_build";
    const isForRent = home.status === "for_rent";
    const isActive = isForSale || isForRent;

    // Extract photos
    const photos: string[] = [];
    if (Array.isArray(home.photos)) {
      for (const p of home.photos) {
        if (p?.href) {
          let url = p.href;
          if (/[-_]s\.jpg$/i.test(url)) url = url.replace(/[-_]s\.jpg$/i, "-od.jpg");
          else if (/s\.jpg$/i.test(url)) url = url.replace(/s\.jpg$/i, "od.jpg");
          photos.push(url);
          if (photos.length >= 20) break;
        }
      }
    }
    if (photos.length === 0 && home.primary_photo?.href) {
      let url = home.primary_photo.href;
      if (/s\.jpg$/i.test(url)) url = url.replace(/s\.jpg$/i, "od.jpg");
      photos.push(url);
    }

    const addr = home.location?.address;
    const price = home.list_price ?? home.price ?? home.estimate?.estimate ?? 0;

    // Upsert into our DB
    const listing = await prisma.listing.upsert({
      where: {
        source_sourceId: {
          source: "realtor",
          sourceId: propertyId,
        },
      },
      update: {
        photos: photos.length > 0 ? photos : undefined,
        description: home.description?.text ?? undefined,
        price: Math.round(price) || undefined,
        cachedAt: new Date(),
      },
      create: {
        source: "realtor",
        sourceId: propertyId,
        status: isActive ? "active" : "off_market",
        address: addr?.line ?? searchText,
        city: addr?.city ?? "",
        state: addr?.state_code ?? "",
        zip: addr?.postal_code ?? "",
        latitude: addr?.coordinate?.lat ?? null,
        longitude: addr?.coordinate?.lon ?? null,
        price: Math.round(price) || 0,
        listingType: isForRent ? "rent" : "sale",
        propertyType: mapPropertyType(home.description?.type, home.description?.sub_type),
        bedrooms: home.description?.beds ?? null,
        bathrooms: home.description?.baths ?? null,
        sqft: home.description?.sqft ?? null,
        lotSqft: home.description?.lot_sqft ?? null,
        yearBuilt: home.description?.year_built ?? null,
        description: home.description?.text ?? null,
        photos,
        parking: home.garage ? `${home.garage} car garage` : null,
        agentName: home.advertisers?.[0]?.name ?? null,
        agentEmail: home.advertisers?.[0]?.email ?? null,
        agentPhone: home.branding?.[0]?.phone ?? null,
        agentBrokerage: home.branding?.[0]?.name ?? null,
        listingUrl: home.href ?? null,
        cachedAt: new Date(),
      },
    });

    return NextResponse.json({
      results: [{
        id: listing.id,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zip: listing.zip,
        price: listing.price,
        listingType: listing.listingType,
        status: listing.status,
        photos: listing.photos,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sqft: listing.sqft,
        propertyType: listing.propertyType,
      }],
      source: "api",
    });
  } catch (e) {
    console.error("[AddressLookup] Error:", e);
    return NextResponse.json({ results: [], source: "error" });
  }
}

async function searchByLocation(query: string): Promise<NextResponse> {
  try {
    // Parse potential city from the query
    const parts = query.split(/[,\s]+/).filter(Boolean);
    const searchBody: Record<string, unknown> = {
      limit: 5,
      offset: 0,
      status: ["for_sale", "for_rent", "sold", "off_market", "ready_to_build"],
      sort: { direction: "desc", field: "list_date" },
    };

    // Try to use as search_location for broader search
    searchBody.search_location = { name: query };

    const res = await fetch(`https://${API_HOST}/properties/v3/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      body: JSON.stringify(searchBody),
    });

    if (!res.ok) return NextResponse.json({ results: [], source: "api_error" });

    const json = await res.json();
    const results = json?.data?.home_search?.results ?? [];

    if (results.length === 0) {
      return NextResponse.json({ results: [], source: "not_found" });
    }

    // Upsert all results
    const upserted = [];
    for (const item of results) {
      const addr = item.location?.address;
      const price = item.list_price ?? item.list_price_max ?? 0;
      if (!addr?.line) continue;

      const photos: string[] = [];
      if (item.primary_photo?.href) {
        let url = item.primary_photo.href;
        if (/s\.jpg$/i.test(url)) url = url.replace(/s\.jpg$/i, "od.jpg");
        photos.push(url);
      }

      const isForRent = item.status === "for_rent";
      const isActive = item.status === "for_sale" || item.status === "for_rent" || item.status === "ready_to_build";

      const listing = await prisma.listing.upsert({
        where: {
          source_sourceId: {
            source: "realtor",
            sourceId: item.property_id,
          },
        },
        update: { cachedAt: new Date() },
        create: {
          source: "realtor",
          sourceId: item.property_id,
          status: isActive ? "active" : "off_market",
          address: addr.line,
          city: addr.city ?? "",
          state: addr.state_code ?? "",
          zip: addr.postal_code ?? "",
          latitude: addr.coordinate?.lat ?? null,
          longitude: addr.coordinate?.lon ?? null,
          price: Math.round(price),
          listingType: isForRent ? "rent" : "sale",
          propertyType: mapPropertyType(item.description?.type, item.description?.sub_type),
          bedrooms: item.description?.beds ?? null,
          bathrooms: item.description?.baths ?? null,
          sqft: item.description?.sqft ?? null,
          photos,
          cachedAt: new Date(),
        },
      });

      upserted.push({
        id: listing.id,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        price: listing.price,
        listingType: listing.listingType,
        status: listing.status,
        photos: listing.photos,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sqft: listing.sqft,
      });
    }

    return NextResponse.json({ results: upserted, source: "api" });
  } catch (e) {
    console.error("[AddressLookup] Location search error:", e);
    return NextResponse.json({ results: [], source: "error" });
  }
}

function mapPropertyType(raw?: string, subType?: string): string {
  const type = (subType || raw || "").toLowerCase();
  if (type.includes("single") || type.includes("house")) return "house";
  if (type.includes("condo")) return "condo";
  if (type.includes("town")) return "townhouse";
  if (type.includes("apartment") || type.includes("multi") || type.includes("duplex")) return "apartment";
  return "house";
}
