import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

const API_HOST = process.env.REALTOR_API_HOST ?? "realty-in-us.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY ?? "";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 30 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!API_KEY) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const res = await fetch(
      `https://${API_HOST}/properties/v3/auto-complete?input=${encodeURIComponent(query)}&limit=8`,
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const json = await res.json();
    const raw = json?.data?.autocomplete ?? [];

    const suggestions = raw
      .filter((s: any) => s.area_type === "city" || s.area_type === "neighborhood" || s.area_type === "postal_code" || s.area_type === "address")
      .map((s: any) => ({
        label: s.full_address ?? [s.city, s.state_code].filter(Boolean).join(", ") ?? s._id,
        city: s.city ?? "",
        state: s.state_code ?? "",
        type: s.area_type,
      }))
      .slice(0, 6);

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
