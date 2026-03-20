"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredLocation, requestGeolocation } from "@/lib/analytics-client";

export default function LocationBanner() {
  const router = useRouter();
  const [location, setLocation] = useState<{ city: string; state: string; latitude: number; longitude: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored && stored.city) {
      setLocation(stored);
    }
    // Slight delay for smooth entrance
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnableLocation = useCallback(async () => {
    setRequesting(true);
    try {
      const loc = await requestGeolocation();
      if (loc && loc.city) {
        setLocation(loc);
      }
    } catch {
      // Silently fail
    } finally {
      setRequesting(false);
    }
  }, []);

  const handleSearchNearby = useCallback(() => {
    if (!location) return;
    const params = new URLSearchParams();
    params.set("city", location.city);
    params.set("lat", String(location.latitude));
    params.set("lng", String(location.longitude));
    params.set("radius", "30");
    router.push(`/?${params.toString()}`);
  }, [location, router]);

  return (
    <div
      className={`mb-5 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {location ? (
        /* User has location */
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-border/60 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-social/10 to-social/5 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-social">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-[13px] text-muted truncate">
              Showing listings near{" "}
              <span className="font-semibold text-ink">{location.city}{location.state ? `, ${location.state}` : ""}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSearchNearby}
              className="text-[12px] font-semibold text-social hover:text-social/80 transition-colors px-2.5 py-1 rounded-lg hover:bg-social/5"
            >
              Search nearby
            </button>
            <button
              onClick={handleEnableLocation}
              className="text-[11px] text-muted hover:text-ink transition-colors px-2 py-1 rounded-lg hover:bg-tag"
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        /* No location yet */
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/80 to-orange-50/40 backdrop-blur-md border border-border/60 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-tag flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-[13px] text-muted">
              Enable location for personalized results
            </span>
          </div>
          <button
            onClick={handleEnableLocation}
            disabled={requesting}
            className="text-[12px] font-semibold text-ink bg-ink/5 hover:bg-ink/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {requesting ? (
              <>
                <div className="w-3 h-3 border-[1.5px] border-ink/30 border-t-ink rounded-full animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Enable
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
