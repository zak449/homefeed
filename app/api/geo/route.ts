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

  // Reverse geocode — run Nominatim and BigDataCloud in parallel, take whichever resolves first
  let city = "";
  let state = "";
  let zip = "";

  const nominatimPromise = (async (): Promise<{ city: string; state: string; zip: string }> => {
    console.log("[Geo] Calling Nominatim for", latitude, longitude);
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          "User-Agent": "HomeFeed/1.0 (https://homefeed.app; contact@homefeed.app)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!geoRes.ok) throw new Error(`Nominatim status ${geoRes.status}`);
    const geo = await geoRes.json();
    const addr = geo.address || {};
    const c = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.county || "";
    if (!c) throw new Error("Nominatim returned no city");
    let s = addr.state || "";
    if (s) s = stateMap[s] || s;
    return { city: c, state: s, zip: addr.postcode || "" };
  })();

  const bigDataCloudPromise = (async (): Promise<{ city: string; state: string; zip: string }> => {
    console.log("[Geo] Calling BigDataCloud for", latitude, longitude);
    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!geoRes.ok) throw new Error(`BigDataCloud status ${geoRes.status}`);
    const geo = await geoRes.json();
    const c = geo.locality || geo.city || "";
    if (!c) throw new Error("BigDataCloud returned no city");
    // principalSubdivisionCode is like "US-CA" → strip to "CA" (already an abbreviation)
    const rawState = geo.principalSubdivisionCode?.replace(/^US-/, "") || "";
    // rawState is already the abbreviation (e.g., "CA"), no need to look up in stateMap
    return { city: c, state: rawState, zip: geo.postcode || "" };
  })();

  try {
    const result = await Promise.any([nominatimPromise, bigDataCloudPromise]);
    city = result.city;
    state = result.state;
    zip = result.zip;
  } catch (e) {
    console.error("[Geo] All reverse geocode providers failed:", e);
  }

  if (!city) {
    console.warn("[Geo] Could not resolve city for coordinates:", latitude, longitude);
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
