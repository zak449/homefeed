import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;

  try {
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId: id } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId: id } } }),
        prisma.comment.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return NextResponse.json({ liked: false });
    } else {
      await prisma.$transaction([
        prisma.commentLike.create({ data: { userId, commentId: id } }),
        prisma.comment.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
      ]);
      // Notify comment author (best-effort)
      try {
        const comment = await prisma.comment.findUnique({
          where: { id }, select: { userId: true, listingId: true },
        });
        if (comment?.userId && comment.userId !== userId) {
          await prisma.notification.create({
            data: {
              userId: comment.userId,
              type: "comment_like",
              title: `${session.user.name ?? "Someone"} liked your take`,
              link: `/listing/${comment.listingId}#comment-${id}`,
            },
          });
        }
      } catch { /* best-effort */ }
      return NextResponse.json({ liked: true });
    }
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}
