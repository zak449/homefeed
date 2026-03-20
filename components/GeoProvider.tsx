"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestGeolocation, getStoredLocation, trackEvent, getAnonId } from "@/lib/analytics-client";

/**
 * GeoProvider — on first visit, requests geolocation and auto-navigates
 * to show listings near the user. Also tracks page views.
 */
export default function GeoProvider() {
  const router = useRouter();
  const sp = useSearchParams();
  const [prompted, setPrompted] = useState(false);

  // Track page view on mount
  useEffect(() => {
    getAnonId(); // Ensure anon ID exists
    trackEvent("page_view", {
      path: window.location.pathname,
      query: window.location.search,
    });
  }, []);

  // Request geolocation on first visit (no city filter active)
  useEffect(() => {
    // Only auto-locate if user hasn't searched for anything
    const hasCity = sp.get("city");
    const hasLat = sp.get("lat");
    if (hasCity || hasLat || prompted) return;

    // Check if we already have a stored location
    const stored = getStoredLocation();
    if (stored?.city) {
      // Already have location — auto-navigate if on homepage with no filters
      const hasAnyFilter = sp.get("type") || sp.get("sort") || sp.get("propertyType");
      if (!hasAnyFilter) {
        router.replace(`/?lat=${stored.latitude}&lng=${stored.longitude}&city=${encodeURIComponent(stored.city)}&radius=25`);
      }
      return;
    }

    // First visit — request location
    setPrompted(true);
    requestGeolocation().then((loc) => {
      if (loc?.city) {
        router.replace(`/?lat=${loc.latitude}&lng=${loc.longitude}&city=${encodeURIComponent(loc.city)}&radius=25`);
      }
    });
  }, [sp, prompted, router]);

  return null; // Invisible component
}
