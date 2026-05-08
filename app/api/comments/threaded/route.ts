import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CommentNode } from "@/components/comments/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/comments/threaded?listingId=xxx — returns nested comment tree
export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const flat = await prisma.comment.findMany({
      where: { listingId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
        likeCount: true,
        isRedFlag: true,
        parentId: true,
        name: true,
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    const byId = new Map<string, CommentNode>();
    flat.forEach((c) => {
      byId.set(c.id, {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        editedAt: c.editedAt?.toISOString() ?? null,
        likeCount: c.likeCount,
        isRedFlag: c.isRedFlag,
        liked: Array.isArray(c.likes) ? c.likes.length > 0 : false,
        parentId: c.parentId,
        user: c.user,
        legacyName: c.user ? null : c.name,
        replies: [],
      });
    });
    const roots: CommentNode[] = [];
    flat.forEach((c) => {
      const node = byId.get(c.id)!;
      if (c.parentId && byId.has(c.parentId)) {
        byId.get(c.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });
    return NextResponse.json({ comments: roots });
  } catch {
    return NextResponse.json({ comments: [], error: "database unreachable" }, { status: 200 });
  }
}

// POST /api/comments/threaded — create new comment (auth required, supports parentId)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { listingId?: string; parentId?: string | null; content?: string }
    | null;
  if (!body?.listingId || !body.content) {
    return NextResponse.json({ error: "listingId and content required" }, { status: 400 });
  }
  const content = body.content.trim().slice(0, 2000);
  if (!content) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const created = await prisma.comment.create({
      data: {
        listingId: body.listingId,
        userId: session.user.id,
        parentId: body.parentId ?? null,
        content,
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
      },
      select: { id: true },
    });

    if (body.parentId) {
      try {
        const parent = await prisma.comment.findUnique({
          where: { id: body.parentId },
          select: { userId: true, listingId: true },
        });
        if (parent?.userId && parent.userId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: parent.userId,
              type: "comment_reply",
              title: `${session.user.name ?? "Someone"} replied to your take`,
              body: content.slice(0, 200),
              link: `/listing/${parent.listingId}#comment-${created.id}`,
            },
          });
        }
      } catch { /* best-effort */ }
    }
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}
