import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Simple zip code to city/state lookup (covers common cases, defaults to "Unknown")
const ZIP_LOOKUP: Record<string, { city: string; state: string }> = {
  "10001": { city: "New York", state: "NY" },
  "90210": { city: "Beverly Hills", state: "CA" },
  "60601": { city: "Chicago", state: "IL" },
  "77001": { city: "Houston", state: "TX" },
  "85001": { city: "Phoenix", state: "AZ" },
};

function lookupZip(zipCode: string) {
  return ZIP_LOOKUP[zipCode] || { city: "Unknown", state: "Unknown" };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode, name, email, address } = body;

    if (!zipCode || !name || !email || !address) {
      return NextResponse.json(
        { error: "Missing required fields: zipCode, name, email, address" },
        { status: 400 }
      );
    }

    const { city, state } = lookupZip(zipCode);

    // Upsert the community for this zip code
    await prisma.zipCommunity.upsert({
      where: { zipCode },
      create: { zipCode, city, state, memberCount: 1 },
      update: { memberCount: { increment: 1 } },
    });

    // Create the verified resident
    const resident = await prisma.verifiedResident.create({
      data: {
        email,
        name,
        zipCode,
        address,
      },
    });

    return NextResponse.json({
      success: true,
      resident: {
        id: resident.id,
        name: resident.name,
        zipCode: resident.zipCode,
        badge: resident.badge,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Handle unique constraint violation (duplicate email)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A resident with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
