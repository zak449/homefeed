import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { _count: { select: { comments: true } } },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(listing);
}
