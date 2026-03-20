"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestGeolocation, getStoredLocation, trackEvent, getAnonId } from "@/lib/analytics-client";

/**
 * GeoProvider — on first visit, requests geolocation and auto-navigates
 * to show listings near the user. Triggers API sync for their city.
 */
export default function GeoProvider() {
  const router = useRouter();
  const sp = useSearchParams();
  const [prompted, setPrompted] = useState(false);

  // Track page view on mount
  useEffect(() => {
    getAnonId();
    trackEvent("page_view", {
      path: window.location.pathname,
      query: window.location.search,
    });
  }, []);

  // Request geolocation on first visit (no city/search active)
  useEffect(() => {
    const hasCity = sp.get("city");
    const hasLat = sp.get("lat");
    const hasType = sp.get("type");
    const hasSort = sp.get("sort");

    // Don't auto-locate if user has any active search/filter
    if (hasCity || hasLat || hasType || hasSort || prompted) return;

    // Check stored location
    const stored = getStoredLocation();
    if (stored?.city) {
      // Trigger sync for their city in background, then navigate
      triggerSyncAndNavigate(stored.city, stored.latitude, stored.longitude, router);
      setPrompted(true);
      return;
    }

    // First visit — request location
    setPrompted(true);
    requestGeolocation().then((loc) => {
      if (loc?.city) {
        triggerSyncAndNavigate(loc.city, loc.latitude, loc.longitude, router);
      }
    });
  }, [sp, prompted, router]);

  return null;
}

async function triggerSyncAndNavigate(
  city: string,
  lat: number,
  lng: number,
  router: ReturnType<typeof useRouter>
) {
  // Navigate immediately so the user sees something
  router.replace(`/?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}&radius=30`);
}
