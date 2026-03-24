"use client";

import { useGeo } from "@/components/GeoProvider";

/**
 * A "Near You" category pill that only appears when user has location.
 * Uses geo search params to filter listings by proximity.
 */
export default function GeoCategoryPill() {
  const { location } = useGeo();

  if (!location) return null;

  const params = new URLSearchParams();
  params.set("lat", String(location.latitude));
  params.set("lng", String(location.longitude));
  params.set("radius", "25");
  if (location.city) params.set("city", location.city);

  return (
    <a
      href={`/?${params.toString()}`}
      className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber/10 to-social/10 border border-amber/30 text-sm font-medium text-ink hover:border-amber/50 hover:shadow-soft active:scale-[0.97] transition-all"
    >
      <span className="text-base">{"\uD83D\uDCCD"}</span>
      <span className="whitespace-nowrap">Near You</span>
    </a>
  );
}
