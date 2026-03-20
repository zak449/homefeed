import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
    }

    // Cap at 50 to prevent abuse
    const limitedIds = ids.slice(0, 50);

    const listings = await prisma.listing.findMany({
      where: { id: { in: limitedIds } },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        neighborhood: true,
        price: true,
        listingType: true,
        propertyType: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        photos: true,
        agentName: true,
        createdAt: true,
        latitude: true,
        longitude: true,
        _count: { select: { comments: true } },
        comments: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { name: true, content: true },
        },
      },
    });

    // Preserve the order of the requested IDs
    const byId = new Map(listings.map((l) => [l.id, l]));
    const ordered = limitedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((l) => ({
        ...l,
        topComment: l!.comments?.[0] ?? null,
      }));

    return NextResponse.json({ listings: ordered });
  } catch (error) {
    console.error("[Batch] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
