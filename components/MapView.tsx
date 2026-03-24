"use client";

import { useEffect, useRef, useCallback } from "react";

interface MapListing {
  id: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  listingType: string;
}

interface MapViewProps {
  listings: MapListing[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

function formatPrice(price: number, listingType: string) {
  if (price >= 1_000_000) {
    return listingType === "rent"
      ? `$${(price / 1000).toFixed(0)}k/mo`
      : `$${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return listingType === "rent"
      ? `$${(price / 1000).toFixed(1)}k/mo`
      : `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price}`;
}

declare global {
  interface Window {
    L: any;
    __gwakMapInstance?: any;
  }
}

export default function MapView({ listings, selectedId, onSelect, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const leafletLoadedRef = useRef(false);

  const geoListings = listings.filter(
    (l) => l.latitude != null && l.longitude != null
  );

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.L || mapRef.current) return;

    const L = window.L;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // Stamen Toner Lite for a clean, stylish look — or CartoDB Voyager for warm tones
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Compact attribution bottom-right
    L.control
      .attribution({ prefix: false, position: "bottomright" })
      .addAttribution(
        '&copy; <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a>'
      )
      .addTo(map);

    mapRef.current = map;
    window.__gwakMapInstance = map;

    addMarkers();
  }, []);

  const addMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current.clear();

    const bounds: [number, number][] = [];

    geoListings.forEach((listing) => {
      const lat = listing.latitude!;
      const lng = listing.longitude!;
      bounds.push([lat, lng]);

      const isSelected = listing.id === selectedId;
      const priceLabel = formatPrice(listing.price, listing.listingType);

      const icon = L.divIcon({
        className: "gwak-price-marker",
        html: `<div class="gwak-marker-pill ${isSelected ? "gwak-marker-selected" : ""}">${priceLabel}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.on("click", () => {
        onSelect?.(listing.id);
      });

      markersRef.current.set(listing.id, marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([39.8283, -98.5795], 4); // Center of US
    }
  }, [geoListings, selectedId, onSelect]);

  // Load Leaflet CSS + JS from CDN
  useEffect(() => {
    if (leafletLoadedRef.current || typeof window === "undefined") return;
    leafletLoadedRef.current = true;

    // Inject marker styles
    const style = document.createElement("style");
    style.textContent = `
      .gwak-price-marker {
        background: none !important;
        border: none !important;
      }
      .gwak-marker-pill {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        letter-spacing: -0.01em;
        white-space: nowrap;
        background: #1a1a1a;
        color: #fff;
        border: 2px solid rgba(255,255,255,0.1);
        box-shadow: 0 2px 12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05);
        cursor: pointer;
        transform: translate(-50%, -100%);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        line-height: 1.2;
        position: relative;
      }
      .gwak-marker-pill::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #1a1a1a;
      }
      .gwak-marker-pill:hover {
        background: #2a2a2a;
        border-color: rgba(212,118,60,0.4);
        transform: translate(-50%, -100%) scale(1.12);
        z-index: 1000 !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(212,118,60,0.15);
      }
      .gwak-marker-selected {
        background: #D4763C !important;
        color: #fff !important;
        border-color: #D4763C !important;
        transform: translate(-50%, -100%) scale(1.15);
        z-index: 999 !important;
        box-shadow: 0 4px 16px rgba(212,118,60,0.5), 0 0 24px rgba(212,118,60,0.2);
      }
      .gwak-marker-selected::after {
        border-top-color: #D4763C !important;
      }
      .gwak-marker-selected:hover {
        background: #E8A87C !important;
        transform: translate(-50%, -100%) scale(1.2);
      }
      .leaflet-container {
        font-family: inherit;
        background: #f5f3ef;
      }
      .leaflet-control-attribution {
        font-size: 9px !important;
        background: rgba(255,255,255,0.6) !important;
        padding: 2px 5px !important;
      }
    `;
    document.head.appendChild(style);

    // Check if Leaflet already loaded
    if (window.L) {
      initMap();
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);
  }, [initMap]);

  // Re-init map when Leaflet becomes available (in case of race)
  useEffect(() => {
    if (window.L && !mapRef.current) {
      initMap();
    }
  }, [initMap]);

  // Update markers when listings or selection changes
  useEffect(() => {
    if (mapRef.current && window.L) {
      addMarkers();
    }
  }, [addMarkers]);

  // Pan to selected marker
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (marker) {
      mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.3 });
    }
  }, [selectedId]);

  if (geoListings.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-highlight rounded-xl border border-divider ${className ?? ""}`}
      >
        <div className="text-center p-8">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto text-tertiary/40 mb-3"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm text-tertiary font-medium">No map data available</p>
          <p className="text-xs text-tertiary/60 mt-1">Listings in this area lack coordinates</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full rounded-xl overflow-hidden ${className ?? ""}`}
      style={{ minHeight: 300 }}
    />
  );
}
