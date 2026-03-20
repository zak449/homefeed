import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/geo
 * Store user's geolocation and create/update their profile.
 *
 * Body: { anonId: string, latitude: number, longitude: number }
 * Response: { city, state, zip }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { anonId, latitude, longitude } = body ?? {};

  if (!anonId || latitude == null || longitude == null) {
    return NextResponse.json({ error: "anonId, latitude, longitude required" }, { status: 400 });
  }

  // Reverse geocode using OpenStreetMap Nominatim (free, no key, accurate city names)
  let city = "";
  let state = "";
  let zip = "";

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      { headers: { "User-Agent": "homefeed/1.0" } }
    );
    if (geoRes.ok) {
      const geo = await geoRes.json();
      const addr = geo.address || {};
      // Nominatim returns city, town, village, or hamlet — pick the most specific
      city = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || "";
      state = addr.state || "";
      zip = addr.postcode || "";

      // Convert full state name to abbreviation
      if (state) {
        const stateMap: Record<string, string> = {
          "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
          "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
          "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
          "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
          "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
          "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
          "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
          "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
          "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
          "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
          "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
          "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
          "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
        };
        state = stateMap[state] || state;
      }
    }
  } catch (e) {
    console.error("[Geo] Reverse geocode error:", e);
  }

  // Fallback to BigDataCloud if Nominatim didn't return a city
  if (!city) {
    try {
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (geoRes.ok) {
        const geo = await geoRes.json();
        city = geo.locality || geo.city || "";
        state = state || (geo.principalSubdivisionCode?.replace("US-", "") || "");
        zip = zip || (geo.postcode || "");
      }
    } catch (e) {
      console.error("[Geo] BigDataCloud fallback error:", e);
    }
  }

  // Upsert user profile with location
  try {
    await prisma.userProfile.upsert({
      where: { anonId },
      update: {
        latitude,
        longitude,
        city: city || undefined,
        state: state || undefined,
        zip: zip || undefined,
        lastSeenAt: new Date(),
      },
      create: {
        anonId,
        latitude,
        longitude,
        city: city || null,
        state: state || null,
        zip: zip || null,
      },
    });
  } catch (e) {
    console.error("[Geo] Profile upsert error:", e);
  }

  return NextResponse.json({ city, state, zip, latitude, longitude });
}
