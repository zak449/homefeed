import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const cursor = url.searchParams.get("cursor");
  const userId = session.user.id;

  try {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: { id: true, type: true, title: true, body: true, link: true, read: true, createdAt: true },
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return NextResponse.json({
      items: items.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
      unread,
    });
  } catch {
    return NextResponse.json({ items: [], unread: 0, error: "database unreachable" });
  }
}
