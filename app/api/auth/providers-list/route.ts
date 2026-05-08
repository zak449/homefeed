import { NextResponse } from "next/server";
import { enabledProviderIds } from "@/lib/auth-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ providers: enabledProviderIds() });
}
