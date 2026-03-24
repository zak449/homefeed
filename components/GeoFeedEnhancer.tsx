"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGeo } from "@/components/GeoProvider";

/**
 * GeoFeedEnhancer — when the user has location, automatically updates
 * the URL to include lat/lng params so the server re-renders the feed
 * filtered by proximity. Only triggers once per location acquisition.
 */
export default function GeoFeedEnhancer() {
  const { location } = useGeo();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!location || hasRedirected.current) return;

    // Only enhance if we're on the default landing (no existing search params)
    const url = new URL(window.location.href);
    const hasExistingSearch = url.searchParams.has("city") || url.searchParams.has("lat") || url.searchParams.has("sort");
    if (hasExistingSearch) return;

    hasRedirected.current = true;

    // Update URL with geo params to trigger server-side proximity filtering
    const params = new URLSearchParams();
    params.set("lat", String(location.latitude));
    params.set("lng", String(location.longitude));
    params.set("radius", "30");
    if (location.city) params.set("city", location.city);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [location, router]);

  return null;
}
