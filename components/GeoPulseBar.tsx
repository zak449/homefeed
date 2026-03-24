"use client";

import { useGeo } from "@/components/GeoProvider";

/**
 * Geo-aware live pulse bar.
 * Shows "X takes near you" when location is known,
 * otherwise shows the default "X takes shared across Y listings" text.
 */
export default function GeoPulseBar({
  commentCount,
  listingCount,
}: {
  commentCount: number;
  listingCount: number;
}) {
  const { location } = useGeo();

  if (commentCount <= 0) return null;

  const hasLocation = location && location.city;

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[11px] text-tertiary">
        {hasLocation
          ? `${commentCount.toLocaleString()} takes near you`
          : `${commentCount.toLocaleString()} takes shared across ${listingCount.toLocaleString()} listings`}
      </span>
    </div>
  );
}
