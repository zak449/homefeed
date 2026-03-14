import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReactionAlert } from "@/lib/email";

const VALID_REACTIONS = ["❤️", "🔥", "😂", "😮", "💭"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const { email, name, type } = body ?? {};

  if (!email || !type || !name) {
    return NextResponse.json({ error: "email, name, type required" }, { status: 400 });
  }
  if (!VALID_REACTIONS.includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { listing: { select: { id: true, address: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const existing = await prisma.reaction.findUnique({
    where: { commentId_email_type: { commentId: id, email, type } },
  });

  let action: "added" | "removed";
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    action = "removed";
  } else {
    await prisma.reaction.create({ data: { commentId: id, email, type } });
    action = "added";

    if (comment.email !== email && comment.email) {
      sendReactionAlert({
        recipientEmail: comment.email,
        recipientName: comment.name,
        reactorName: name,
        reactionType: type,
        listingAddress: comment.listing.address,
        listingId: comment.listing.id,
        commentSnippet: comment.content.slice(0, 120),
      }).catch(console.error);
    }
  }

  const reactions = await prisma.reaction.groupBy({
    by: ["type"],
    where: { commentId: id },
    _count: { type: true },
  });

  const reactionMap: Record<string, number> = {};
  for (const r of reactions) reactionMap[r.type] = r._count.type;

  return NextResponse.json({ action, reactions: reactionMap });
}
