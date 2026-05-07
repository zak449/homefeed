import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "database unreachable" }, { status: 503 });
  }
}
