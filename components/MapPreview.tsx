"use client";

/**
 * MapPreview — Dark-themed static map with pin marker.
 * Uses Google Maps Static API for a branded look,
 * falls back to styled card with directions link.
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
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${latitude},${longitude}`)}`;

  // Dark map style for Google Maps Static API
  const darkStyle = [
    "style=element:geometry|color:0x0A0A0A",
    "style=element:labels.text.fill|color:0x888888",
    "style=element:labels.text.stroke|color:0x0A0A0A",
    "style=feature:road|element:geometry|color:0x1A1A1A",
    "style=feature:road|element:geometry.stroke|color:0x2A2A2A",
    "style=feature:road.highway|element:geometry|color:0x222222",
    "style=feature:water|element:geometry|color:0x111111",
    "style=feature:poi.park|element:geometry|color:0x111111",
    "style=feature:poi|element:labels|visibility:off",
    "style=feature:transit|visibility:off",
    "style=feature:administrative|element:geometry.stroke|color:0x1A1A1A",
  ].join("&");

  // Orange pin marker matching Gwaky brand
  const marker = `markers=color:0xFF4D00|label:G|${latitude},${longitude}`;

  const apiKey = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Static map image URL
  const staticMapUrl = apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=800x400&scale=2&maptype=roadmap&${darkStyle}&${marker}&key=${apiKey}`
    : null;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#0E0E0E] ${className ?? ""}`}>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative group cursor-pointer"
      >
        {staticMapUrl ? (
          <img
            src={staticMapUrl}
            alt={address ? `Map of ${address}` : "Property location"}
            className="w-full h-[220px] object-cover"
            loading="lazy"
          />
        ) : (
          /* Dark-themed custom map using iframe with dark embed */
          <div className="relative w-full h-[220px] bg-[#111]">
            <iframe
              src={`https://maps.google.com/maps?q=${latitude},${longitude}&output=embed&z=${zoom}`}
              className="w-full h-full"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.95) contrast(1.1)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={address ? `Map of ${address}` : "Property location map"}
            />
            {/* Pin overlay since iframe filter inverts Google's pin */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative -mt-4">
                <svg width="32" height="40" viewBox="0 0 24 30" fill="none">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z" fill="#FF4D00" />
                  <circle cx="12" cy="11" r="4" fill="#0A0A0A" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
      </a>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111]">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#FF4D00] shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="3" fill="currentColor" />
          </svg>
          {address && (
            <span className="text-[#C0C0C0] text-sm truncate">{address}</span>
          )}
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#FF4D00] font-semibold hover:text-[#FF4D00]/80 transition-colors whitespace-nowrap ml-3"
        >
          Directions →
        </a>
      </div>
    </div>
  );
}
