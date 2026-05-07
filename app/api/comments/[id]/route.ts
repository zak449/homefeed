import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  if (!body?.content) return NextResponse.json({ error: "content required" }, { status: 400 });

  try {
    const existing = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await prisma.comment.update({
      where: { id },
      data: { content: body.content.slice(0, 2000), editedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}
