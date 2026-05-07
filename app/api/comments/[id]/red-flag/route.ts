import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await prisma.comment.findUnique({ where: { id }, select: { isRedFlag: true } });
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    await prisma.comment.update({ where: { id }, data: { isRedFlag: !existing.isRedFlag } });
    return NextResponse.json({ isRedFlag: !existing.isRedFlag });
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}
