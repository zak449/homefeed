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

  // Reverse geocode using free BigDataCloud API (no key needed)
  let city = "";
  let state = "";
  let zip = "";

  try {
    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (geoRes.ok) {
      const geo = await geoRes.json();
      city = geo.city || geo.locality || "";
      state = geo.principalSubdivisionCode?.replace("US-", "") || "";
      zip = geo.postcode || "";
    }
  } catch (e) {
    console.error("[Geo] Reverse geocode error:", e);
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
