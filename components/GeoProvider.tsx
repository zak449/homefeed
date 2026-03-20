"use client";

import { useEffect } from "react";
import { requestGeolocation, trackEvent, getAnonId, getStoredLocation } from "@/lib/analytics-client";

/**
 * GeoProvider — silently requests geolocation and stores it.
 * Does NOT auto-redirect. The user's location is saved so "Near Me"
 * works instantly, and analytics track where users are from.
 *
 * The homepage always shows all listings until the user actively searches.
 */
export default function GeoProvider() {
  // Track page view
  useEffect(() => {
    getAnonId();
    trackEvent("page_view", {
      path: window.location.pathname,
      query: window.location.search,
    });
  }, []);

  // Silently request + store geolocation (no redirect)
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) return; // Already have location

    // Request in background — just store it for "Near Me" button
    requestGeolocation().catch(() => {});
  }, []);

  return null;
}
