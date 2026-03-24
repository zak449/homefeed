import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewCommentAlert } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  // Check listing status
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { status: true },
  });

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // If listing is sold/off_market, still return comments but mark as locked
  const comments = await prisma.comment.findMany({
    where: { listingId },
    orderBy: { createdAt: "asc" },
    include: {
      reactions: {
        select: { type: true, email: true },
      },
    },
  });

  const formatted = comments.map((c: { id: string; name: string; content: string; createdAt: Date; reactions: { type: string; email: string }[] }) => {
    const reactionMap: Record<string, number> = {};
    for (const r of c.reactions) {
      reactionMap[r.type] = (reactionMap[r.type] ?? 0) + 1;
    }
    return {
      id: c.id,
      name: c.name,
      content: c.content,
      createdAt: c.createdAt,
      reactions: reactionMap,
    };
  });

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 10 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const { listingId, name, email, content } = body ?? {};

  if (!listingId || !name || !email || !content) {
    return NextResponse.json({ error: "listingId, name, email, content required" }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length === 0 || content.length > 1000) {
    return NextResponse.json({ error: "Content must be 1–1000 characters" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Check listing exists AND is active — no comments on sold/off_market listings
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, address: true, status: true },
  });

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (listing.status !== "active") {
    return NextResponse.json(
      { error: "Comments are locked — this listing is no longer active" },
      { status: 403 }
    );
  }

  // Check for duplicate comment (same listing, same content, within the last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const duplicate = await prisma.comment.findFirst({
    where: {
      listingId,
      content: { equals: content.trim(), mode: "insensitive" },
      createdAt: { gte: oneHourAgo },
    },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "You already posted this comment" },
      { status: 409 }
    );
  }

  const comment = await prisma.comment.create({
    data: { listingId, name: name.trim().slice(0, 80), email, content: content.trim() },
  });

  // Auto-subscribe this commenter
  await prisma.emailSubscription.upsert({
    where: { listingId_email: { listingId, email } },
    update: {},
    create: { listingId, email },
  });

  // Notify other subscribers (excluding this commenter)
  const subs = await prisma.emailSubscription.findMany({
    where: { listingId, NOT: { email } },
    select: { email: true },
  });

  sendNewCommentAlert({
    subscribers: subs.map((s: { email: string }) => s.email),
    commenterName: name.trim(),
    listingAddress: listing.address,
    listingId: listing.id,
    commentSnippet: content.trim().slice(0, 120),
  }).catch(console.error);

  return NextResponse.json({
    id: comment.id,
    name: comment.name,
    content: comment.content,
    createdAt: comment.createdAt,
    reactions: {},
  }, { status: 201 });
}
