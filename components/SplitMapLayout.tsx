"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface MapListing {
  id: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  listingType: string;
}

interface SplitMapLayoutProps {
  listings: MapListing[];
  children: React.ReactNode;
}

export default function SplitMapLayout({ listings, children }: SplitMapLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showMobileMap, setShowMobileMap] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    // On mobile, when selecting from map, close the map overlay
    // and scroll to the listing (optional enhancement)
  }, []);

  const geoCount = listings.filter(
    (l) => l.latitude != null && l.longitude != null
  ).length;

  // If no listings have coordinates, just render children without the map
  if (geoCount === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* ── DESKTOP: side-by-side layout ── */}
      <div className="hidden sm:flex gap-0">
        {/* Left: scrollable listings */}
        <div className="w-[55%] min-w-0">
          {children}
        </div>

        {/* Right: sticky map */}
        <div className="w-[45%] min-w-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] p-2 pl-0">
            <MapView
              listings={listings}
              selectedId={selectedId}
              onSelect={handleSelect}
              className="h-full shadow-card border border-divider"
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE: listings with map toggle ── */}
      <div className="sm:hidden">
        {children}

        {/* Map toggle FAB */}
        <button
          onClick={() => setShowMobileMap(!showMobileMap)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-bg text-sm font-bold shadow-elevated hover:opacity-90 active:scale-95 transition-all"
        >
          {showMobileMap ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              List
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Map
            </>
          )}
        </button>

        {/* Mobile map overlay */}
        {showMobileMap && (
          <div className="fixed inset-0 top-14 z-30 bg-bg">
            <MapView
              listings={listings}
              selectedId={selectedId}
              onSelect={(id) => {
                handleSelect(id);
                setShowMobileMap(false);
              }}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
