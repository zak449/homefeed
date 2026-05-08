import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-z0-9_]{3,32}$/i;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { username?: string | null; bio?: string | null; avatarUrl?: string | null }
    | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const username = body.username ? body.username.trim().toLowerCase() : null;
  if (username && !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "username must be 3-32 letters, numbers, or underscores" },
      { status: 400 }
    );
  }

  try {
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: session.user.id } },
        select: { id: true },
      });
      if (existing) return NextResponse.json({ error: "username taken" }, { status: 409 });
    }
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        bio: body.bio?.slice(0, 280) ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
      select: { id: true, username: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: "database unreachable; please try again later" },
      { status: 503 }
    );
  }
}
