/**
 * TempSpikeEvent — "🌡️ heating up" feed card.
 *
 * Surfaces when a listing's Tea Temp has spiked: 3+ new takes in a short
 * window. Distinct from a normal listing card — big display type, a mini
 * dial showing the current temperature, and a subtle vapor animation
 * rising off the dial. Server component.
 *
 * Self-guards: if currentTemp < 50 or takesInWindow < 3 → renders nothing.
 */

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

interface TseListing {
  id: string;
  address: string;
  price: number;
  listingType?: string;
  photos: string[];
}

export interface TempSpikeEventProps {
  listing: TseListing;
  /** 0–212 °F per the TeaTemperature scale. */
  currentTemp: number;
  takesInWindow: number;
  /** Human-readable window label, e.g. "6h", "last 6 hours", "today". */
  windowLabel: string;
}

function fmtPrice(price: number, listingType?: string): string {
  return listingType === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

export default function TempSpikeEvent({
  listing,
  currentTemp,
  takesInWindow,
  windowLabel,
}: TempSpikeEventProps) {
  // Bail when the spike isn't strong enough — keeps the feed honest.
  if (currentTemp < 50 || takesInWindow < 3) return null;

  // Mini-dial geometry — 64px square, half-circle sweep from -90° (cold)
  // to +90° (boiling).
  const needleDeg = Math.max(-90, Math.min(90, ((currentTemp / 212) * 180) - 90));
  const fillRatio = Math.min(1, Math.max(0, currentTemp / 212));
  // Arc length for path "M 8 56 A 24 24 0 0 1 56 56" ≈ π*24 ≈ 75.4
  const arcLen = 75.4;
  const dashOffset = arcLen - arcLen * fillRatio;

  const photo = listing.photos[0] ?? null;
  const shortAddr = listing.address.split(",")[0];

  return (
    <>
      {/* Inline keyframe so we don't have to touch globals.css. */}
      <style>{`
        @keyframes temp-spike-vapor {
          0%   { transform: translateY(0) scaleX(1);   opacity: 0; }
          15%  { opacity: 0.55; }
          70%  { opacity: 0.25; }
          100% { transform: translateY(-22px) scaleX(0.7); opacity: 0; }
        }
        .temp-spike-vapor-puff {
          animation: temp-spike-vapor 3.4s ease-out infinite;
          transform-origin: 50% 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .temp-spike-vapor-puff {
            animation: none !important;
            opacity: 0.25 !important;
            transform: none !important;
          }
        }
      `}</style>

      <section
        aria-label={`Heating up: ${takesInWindow} new takes in ${windowLabel}`}
        className="relative rounded-2xl overflow-hidden border border-accent/30 shadow-glow"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,77,0,0.18) 0%, transparent 55%), linear-gradient(180deg, #1E1E2A 0%, #181221 100%)",
        }}
      >
        <div className="p-5 sm:p-6">
          {/* Eyebrow */}
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B2C] flex items-center gap-1.5 mb-3">
            <span aria-hidden="true">🌡️</span>
            Heating up
          </p>

          <div className="flex items-start gap-4 sm:gap-5">
            {/* Big takes-in-window display */}
            <div className="min-w-0 flex-1">
              <p
                className="text-ink font-extrabold leading-[0.95] tracking-tight"
                style={{
                  fontFamily:
                    '"Bebas Neue", "Space Grotesk", system-ui, sans-serif',
                  fontSize: "clamp(2.25rem, 8.5vw, 3rem)",
                }}
              >
                {takesInWindow} takes
              </p>
              <p className="text-[12px] sm:text-[13px] text-secondary mt-1 font-medium">
                in the last {windowLabel}
              </p>
            </div>

            {/* Mini dial + vapor */}
            <div className="relative shrink-0" style={{ width: 64, height: 80 }}>
              {/* Vapor puffs */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-5 flex justify-around pointer-events-none"
              >
                <span
                  className="temp-spike-vapor-puff block w-1.5 h-1.5 rounded-full bg-white/55"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="temp-spike-vapor-puff block w-1 h-1 rounded-full bg-white/45"
                  style={{ animationDelay: "0.9s" }}
                />
                <span
                  className="temp-spike-vapor-puff block w-1.5 h-1.5 rounded-full bg-white/50"
                  style={{ animationDelay: "1.7s" }}
                />
              </div>

              {/* Dial */}
              <svg viewBox="0 0 64 64" className="absolute inset-x-0 bottom-0 w-16 h-16" aria-hidden="true">
                <defs>
                  <linearGradient id="tse-dial-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFAA00" />
                    <stop offset="60%" stopColor="#FF4D00" />
                    <stop offset="100%" stopColor="#FF3B3B" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <path
                  d="M 8 56 A 24 24 0 0 1 56 56"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Fill */}
                <path
                  d="M 8 56 A 24 24 0 0 1 56 56"
                  fill="none"
                  stroke="url(#tse-dial-grad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={arcLen}
                  strokeDashoffset={dashOffset}
                />
                {/* Needle */}
                <g
                  style={{
                    transformOrigin: "32px 56px",
                    transform: `rotate(${needleDeg}deg)`,
                  }}
                >
                  <line x1="32" y1="56" x2="32" y2="34" stroke="#FF4D00" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="32" cy="56" r="3" fill="#FF4D00" />
                </g>
                {/* Reading */}
                <text
                  x="32"
                  y="52"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="rgba(255,255,255,0.92)"
                  fontFamily="Space Grotesk, system-ui, sans-serif"
                >
                  {Math.round(currentTemp)}°
                </text>
              </svg>
            </div>
          </div>

          {/* Mini listing card */}
          <Link
            href={`/listing/${listing.id}`}
            className="mt-5 flex items-center gap-3 rounded-2xl border border-divider bg-bg/40 hover:border-accent/40 transition-colors p-3 group"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-elevated">
              {photo ? (
                <FallbackImage
                  src={photo}
                  alt={shortAddr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-elevated" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink truncate">
                {shortAddr}
              </p>
              <p className="text-[12px] text-accent-warm font-bold tabular-nums">
                {fmtPrice(listing.price, listing.listingType)}
              </p>
            </div>
          </Link>

          {/* CTA */}
          <Link
            href={`/listing/${listing.id}#all-spills`}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:text-accent-warm transition-colors"
          >
            Catch up before it boils over
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}
