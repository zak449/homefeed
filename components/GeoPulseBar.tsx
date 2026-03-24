"use client";

import { useGeo } from "@/components/GeoProvider";

/**
 * Geo-aware live pulse bar.
 * Shows "X takes near you" when location is known,
 * otherwise shows the default "X takes across Y listings" text.
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
    <div className="flex items-center gap-2 px-4 py-2.5 bg-highlight/60 border-b border-divider">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs text-secondary">
        {hasLocation ? (
          <>
            {commentCount.toLocaleString()} takes near you &mdash;{" "}
            <span className="text-amber font-semibold">Stop buying blind</span>
          </>
        ) : (
          <>
            {commentCount.toLocaleString()} takes across {listingCount.toLocaleString()} listings &mdash;{" "}
            <span className="text-amber font-semibold">Stop buying blind</span>
          </>
        )}
      </span>
    </div>
  );
}
