"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { requestGeolocation, trackEvent, getAnonId, getStoredLocation } from "@/lib/analytics-client";

export type GeoLocation = {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip?: string;
};

type GeoContextValue = {
  location: GeoLocation | null;
  loading: boolean;
  /** Manually trigger geolocation request (e.g. from a button) */
  requestLocation: () => Promise<GeoLocation | null>;
};

const GeoContext = createContext<GeoContextValue>({
  location: null,
  loading: false,
  requestLocation: async () => null,
});

export function useGeo() {
  return useContext(GeoContext);
}

/**
 * GeoProvider — silently requests geolocation and stores it.
 * Exposes location via React context so any child component can consume it.
 *
 * The homepage always shows all listings until the user actively searches,
 * but child components can use the location to personalize UI.
 */
export default function GeoProvider({ children }: { children?: ReactNode }) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);

  // Track page view
  useEffect(() => {
    getAnonId();
    trackEvent("page_view", {
      path: window.location.pathname,
      query: window.location.search,
    });
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    try {
      const loc = await requestGeolocation();
      if (loc && loc.city) {
        setLocation(loc);
        return loc;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, only restore previously stored location — never auto-request
  // The user must explicitly tap "Use Current Location" in the search bar
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored && stored.city) {
      setLocation(stored);
    }
  }, []);

  return (
    <GeoContext.Provider value={{ location, loading, requestLocation }}>
      {children}
    </GeoContext.Provider>
  );
}
