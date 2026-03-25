"use client";

import { useState } from "react";

/**
 * MapPreview — Google Maps embed iframe (no API key required).
 * Falls back to address + Google Maps link if iframe fails.
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
  const [failed, setFailed] = useState(false);

  // Build query from address if available, otherwise use coordinates
  const query = address
    ? encodeURIComponent(address)
    : `${latitude},${longitude}`;

  const embedUrl = `https://maps.google.com/maps?q=${query}&output=embed&z=${zoom}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${latitude},${longitude}`)}`;

  if (failed) {
    return (
      <div className={`rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center ${className ?? ""}`} style={{ minHeight: 200 }}>
        <div className="text-center py-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mx-auto text-[#555] mb-3">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {address && (
            <p className="text-sm text-[#E0E0E0] mb-2 px-4">{address}</p>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#FF4D00] font-semibold hover:text-[#FF4D00]/80 transition-colors inline-block"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-[#1A1A1A] ${className ?? ""}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: "12px", display: "block" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        onError={() => setFailed(true)}
        title={address ? `Map of ${address}` : "Property location map"}
      />
      {/* Fallback link below the map */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center py-2 text-xs text-[#888] hover:text-[#FF4D00] transition-colors"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}
