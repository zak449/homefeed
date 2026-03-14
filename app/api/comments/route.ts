import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewCommentAlert } from "@/lib/email";

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { listingId },
    orderBy: { createdAt: "asc" },
    include: {
      reactions: {
        select: { type: true, email: true },
      },
    },
  });

  // Group reactions by type with counts, hide raw emails
  const formatted = comments.map((c) => {
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

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, address: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

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
    subscribers: subs.map((s) => s.email),
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
