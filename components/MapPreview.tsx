"use client";

import { useState } from "react";

/**
 * MapPreview — lightweight static map preview using OpenStreetMap tiles.
 * No API key needed. Uses the free staticmap.openstreetmap.de service.
 */
export default function MapPreview({
  latitude,
  longitude,
  address,
  zoom = 15,
  className,
}: {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=600x300&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;

  // Google Maps directions link
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (failed) {
    return (
      <div className={`rounded-xl bg-tag flex items-center justify-center ${className ?? ""}`} style={{ minHeight: 160 }}>
        <div className="text-center py-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-muted/30 mb-2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-[11px] text-muted">Map unavailable</p>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-social font-semibold hover:underline mt-1 inline-block"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className ?? ""}`}>
      {/* Skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" style={{ minHeight: 160 }} />
      )}

      {/* Map image */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapUrl}
          alt={address ? `Map of ${address}` : "Property location map"}
          className={`w-full h-auto rounded-xl transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ minHeight: 160 }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200 rounded-xl flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm text-ink text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-sm">
            Open in Maps
          </span>
        </div>
      </a>
    </div>
  );
}
