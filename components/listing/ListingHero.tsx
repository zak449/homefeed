"use client";

/**
 * ListingHero — full-viewport immersive top of the listing page.
 *
 * The user opens the listing and falls IN. No header. No section break. A
 * single image that breathes (ken-burns 8s), a dark gradient scrim, price +
 * address overlaid at the bottom, a Tea Temperature dial pinned top-right
 * that animates from 0 → score on mount, a status pill top-left, and a
 * bouncing chevron at the bottom that whispers "keep scrolling".
 *
 * All motion respects prefers-reduced-motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import FallbackImage from "@/components/FallbackImage";
import { computeTeaTemp } from "@/components/TeaTemperature";

interface Props {
  heroPhoto: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  pricePerSqft: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  statusLabel: string;
  statusTone: "active" | "sold" | "pending" | "off_market";
  commentCount: number;
  recentCount: number;
  uniqueCommenters: number;
}

export default function ListingHero({
  heroPhoto,
  address,
  city,
  state,
  zip,
  price,
  pricePerSqft,
  bedrooms,
  bathrooms,
  sqft,
  statusLabel,
  statusTone,
  commentCount,
  recentCount,
  uniqueCommenters,
}: Props) {
  const tea = useMemo(
    () =>
      computeTeaTemp({
        commentCount,
        recentCount,
        uniqueCommenters,
        hotCount: Math.min(commentCount, Math.floor(commentCount / 4)),
      }),
    [commentCount, recentCount, uniqueCommenters],
  );

  const heroRef = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);
  const [animatedTemp, setAnimatedTemp] = useState(0);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Animate dial 0 → score on mount
  useEffect(() => {
    if (reduced) {
      setAnimatedTemp(tea.tempF);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedTemp(Math.round(tea.tempF * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tea.tempF, reduced]);

  const statusToneClass: Record<typeof statusTone, string> = {
    active: "bg-emerald-500/90 text-white",
    pending: "bg-accent-warm/90 text-bg",
    sold: "bg-white/90 text-bg",
    off_market: "bg-white/85 text-bg",
  };

  // SVG dial
  const R = 24;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, animatedTemp / 212));
  const dashOffset = C * (1 - pct);

  const specChips: string[] = [];
  if (bedrooms != null) specChips.push(`${bedrooms} bd`);
  if (bathrooms != null) specChips.push(`${bathrooms} ba`);
  if (sqft != null) specChips.push(`${sqft.toLocaleString()} sqft`);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden bg-bg"
      style={{
        // Mobile: 100svh keeps space for browser chrome.
        // Desktop: cap so we don't make a 1000px wall.
        height: "min(100svh, 720px)",
        minHeight: "560px",
      }}
      aria-label={`${address}, ${city}, ${state}`}
    >
      {/* ── Photo, ken-burns ── */}
      {heroPhoto ? (
        <FallbackImage
          src={heroPhoto}
          alt={address}
          className="absolute inset-0 w-full h-full object-cover lh-ken"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-highlight">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-tertiary/30">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </div>
      )}

      {/* ── Top + bottom scrims (legibility) ── */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-black/65 via-black/25 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none bg-gradient-to-t from-black/85 via-black/55 to-transparent" />

      {/* ── Top-left status pill ── */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full backdrop-blur-md shadow-soft ${statusToneClass[statusTone]}`}
        >
          {statusTone === "active" && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* ── Top-right Tea Temperature dial ── */}
      <button
        type="button"
        onClick={() => setShowTip((v) => !v)}
        onBlur={() => setShowTip(false)}
        className="absolute top-3.5 right-3.5 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-full"
        aria-label={`Tea Temperature ${tea.tempF} degrees, ${tea.tierLabel}. Tap for details.`}
      >
        <span
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-lg"
          style={{ boxShadow: `0 0 24px ${tea.color}40, 0 1px 2px rgba(0,0,0,0.4)` }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0" aria-hidden="true">
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
            <circle
              cx="28"
              cy="28"
              r={R}
              fill="none"
              stroke={tea.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dashoffset 220ms linear" }}
            />
          </svg>
          <span className="relative font-bold tabular-nums text-white text-[14px] leading-none" style={{ color: tea.color }}>
            {animatedTemp}
          </span>
        </span>
        {showTip && (
          <span
            role="tooltip"
            className="absolute right-0 top-[64px] w-60 text-left px-3 py-2 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[12px] text-white shadow-lg"
          >
            <span className="block font-bold" style={{ color: tea.color }}>
              {tea.tierEmoji} {tea.tempF}°F · {tea.tierLabel}
            </span>
            <span className="block text-white/80 mt-0.5">{tea.oneLiner}</span>
          </span>
        )}
      </button>

      {/* ── Bottom overlay: price + address + chips ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-20 sm:pb-24 sm:px-8">
        <h1 className="font-display text-[2.6rem] sm:text-[3.4rem] text-white leading-[0.95] tracking-[-0.035em] font-extrabold drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
          {price}
        </h1>
        <p className="mt-1.5 text-white text-[1.05rem] sm:text-xl font-semibold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
          {address}
          <span className="text-white/75 font-medium">, {city}, {state} {zip}</span>
        </p>

        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {specChips.map((chip) => (
            <span
              key={chip}
              className="text-[12px] font-semibold text-white bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full"
            >
              {chip}
            </span>
          ))}
          {pricePerSqft && (
            <span className="text-[12px] font-medium text-white/70 px-1">
              · {pricePerSqft}
            </span>
          )}
        </div>
      </div>

      {/* ── Bottom-center scroll cue ── */}
      <a
        href="#agent-vs-neighbor"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/85 text-[11px] font-bold uppercase tracking-[0.18em]"
        aria-label="Scroll for the truth"
      >
        <span>Scroll for the truth</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lh-bounce">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>

      {/* ── Local styles (no globals.css edits allowed) ── */}
      <style jsx>{`
        .lh-ken {
          transform: scale(1.02);
          animation: lh-ken-burns 16s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes lh-ken-burns {
          0% { transform: scale(1.02) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
        }
        .lh-bounce {
          animation: lh-bounce 1.8s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes lh-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lh-ken { animation: none !important; transform: scale(1) !important; }
          .lh-bounce { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
