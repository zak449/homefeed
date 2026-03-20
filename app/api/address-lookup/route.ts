/**
 * Address Lookup API — searches for ANY property by address
 * Uses the shared lookupAddress function from lib/address-lookup.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { lookupAddress } from "@/lib/address-lookup";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const result = await lookupAddress(query.trim());
  return NextResponse.json(result);
}
