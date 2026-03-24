import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

// Validate US zip code format: 5 digits, optionally followed by -4 digits
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

function normalizeZip(zipCode: string): string {
  // Use the 5-digit prefix as the community identifier
  return zipCode.slice(0, 5);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 3 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { zipCode, name, email, address } = body;

    if (!zipCode || !name || !email || !address) {
      return NextResponse.json(
        { error: "Missing required fields: zipCode, name, email, address" },
        { status: 400 }
      );
    }

    if (!US_ZIP_REGEX.test(zipCode)) {
      return NextResponse.json(
        { error: "Invalid zip code format. Must be 5 digits (e.g. 10001) or 5+4 (e.g. 10001-1234)" },
        { status: 400 }
      );
    }

    const communityZip = normalizeZip(zipCode);

    // Upsert the community for this zip code
    await prisma.zipCommunity.upsert({
      where: { zipCode: communityZip },
      create: { zipCode: communityZip, city: communityZip, state: "", memberCount: 1 },
      update: { memberCount: { increment: 1 } },
    });

    // Create the verified resident
    const resident = await prisma.verifiedResident.create({
      data: {
        email,
        name,
        zipCode: communityZip,
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
