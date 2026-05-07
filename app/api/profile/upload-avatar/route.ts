import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Avatar uploads are not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "file too large (max 4MB)" }, { status: 413 });
  }

  // Lazy import so the build doesn't fail if @vercel/blob isn't installed in dev.
  const { put } = await import("@vercel/blob");
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `avatars/${session.user.id}-${Date.now()}.${ext}`;
  const blob = await put(key, file, { access: "public", contentType: file.type });

  return NextResponse.json({ url: blob.url });
}
