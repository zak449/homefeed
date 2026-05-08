"use client";

/**
 * Tea Temperature — the per-listing hero power tool.
 *
 * This is Gwaky's Zestimate-equivalent: a single, screenshottable, opinionated
 * 0–212°F gauge that combines comment volume, sentiment, recency, and source
 * diversity into one number. It lives at the top of every listing page above
 * the photos. Users tweet it. Users send it in iMessage. It's the brand's
 * "you can only get this here" moment.
 *
 * Inputs (all optional — component degrades gracefully):
 *   - commentCount        total comments on the listing
 *   - hotCount            comments with 🔥 hot-take threshold reached
 *   - redFlagCount        comments toggled as 🚩 red flags
 *   - recentCount         comments in the last 7 days
 *   - uniqueCommenters    distinct authors (source diversity signal)
 *   - verdict             optional 1-line AI verdict ("Boiling. 47 takes…")
 *
 * Compute (see `computeTeaTemp`): a deterministic, log-scaled 0–212°F number
 * with verdict tier + brand color.
 *
 * Two variants:
 *   <TeaTemperature .../>           full hero — for listing detail
 *   <TeaTempPill ... />              compact — for ListingCard, related listings
 *
 * See DESIGN_VISION.md for the why.
 */

import { useEffect, useMemo, useState } from "react";

// ─── Public types ──────────────────────────────────────────

export type TeaTier = "cold" | "warm" | "hot" | "boiling";

export interface TeaTempInput {
  commentCount?: number;
  hotCount?: number;
  redFlagCount?: number;
  recentCount?: number;
  uniqueCommenters?: number;
}

export interface TeaTempResult {
  tempF: number;            // 0–212
  tier: TeaTier;
  tierLabel: string;        // "Boiling", "Hot", "Warm", "Cold"
  tierEmoji: string;
  oneLiner: string;         // fallback verdict when none provided
  color: string;            // hex for gauge fill
  needleDeg: number;        // -90 (cold) to +90 (boil)
  isLive: boolean;          // true when tier ≥ hot
}

// ─── Compute ───────────────────────────────────────────────

/**
 * Maps raw signals to a 0–212°F temperature.
 *
 * Volume is log-scaled so a listing with 5 takes is meaningfully different
 * from one with 0, but a listing with 50 takes isn't 10× hotter than one
 * with 5. Recency dominates: a stale listing with 100 old takes is "Warm,"
 * not "Boiling". Source diversity prevents a single user from boiling a
 * listing on their own.
 *
 * The numbers are tuned for "good vibes for early product use" — i.e. real
 * activity gets to Boiling, but not so fast that everything looks fake-hot.
 */
export function computeTeaTemp(input: TeaTempInput = {}): TeaTempResult {
  const c   = Math.max(0, input.commentCount ?? 0);
  const h   = Math.max(0, input.hotCount ?? 0);
  const r   = Math.max(0, input.redFlagCount ?? 0);
  const rc  = Math.max(0, input.recentCount ?? 0);
  const u   = Math.max(0, input.uniqueCommenters ?? 0);

  // Volume — log-scaled, capped contribution: 0 at 0 comments, ~80°F at 50+
  const volumePts = c === 0 ? 0 : Math.min(80, Math.round(28 * Math.log10(c + 1)));

  // Recency — a 7-day burn — up to 60°F
  const recencyPts = rc === 0 ? 0 : Math.min(60, Math.round(20 * Math.log10(rc + 1)));

  // Hot/red-flag intensity — up to 40°F.
  // Hot takes and red flags both count: people are arguing, that's heat.
  const intensityPts = Math.min(40, (h + r) * 6);

  // Source diversity — up to 32°F. Solo voices don't boil.
  const diversityPts = u === 0 ? 0 : Math.min(32, Math.round(12 * Math.log10(u + 1)));

  // Floor of 32°F (it's always ABOVE freezing — the listing exists)
  // unless there's literally no data at all.
  let raw = volumePts + recencyPts + intensityPts + diversityPts;
  if (c === 0 && rc === 0) raw = 0;
  const tempF = Math.min(212, raw === 0 ? 0 : Math.max(32, raw + 32));

  let tier: TeaTier;
  let tierLabel: string;
  let tierEmoji: string;
  let color: string;
  if (tempF >= 200) {        tier = "boiling"; tierLabel = "Boiling"; tierEmoji = "🌶️"; color = "#C8FF3E"; }
  else if (tempF >= 140) {   tier = "hot";     tierLabel = "Hot";     tierEmoji = "🔥"; color = "#FF2E93"; }
  else if (tempF >= 80) {    tier = "warm";    tierLabel = "Warm";    tierEmoji = "🫖"; color = "#FF7DBC"; }
  else {                     tier = "cold";    tierLabel = "Cold";    tierEmoji = "🧊"; color = "#5EEAD4"; }

  // Needle position: 0°F → -90°, 212°F → +90°
  const needleDeg = Math.round(((tempF / 212) * 180) - 90);

  // Default 1-liner — used when no AI verdict is provided
  let oneLiner: string;
  if (tier === "boiling") {
    oneLiner = c > 0
      ? `Boiling. ${c} take${c === 1 ? "" : "s"}, ${rc} this week. The block is talking.`
      : `Boiling. The block is talking.`;
  } else if (tier === "hot") {
    oneLiner = c > 0
      ? `Hot. ${c} take${c === 1 ? "" : "s"} — ${h ? `${h} hit hot status.` : "neighbors are weighing in."}`
      : `Hot. Neighbors are weighing in.`;
  } else if (tier === "warm") {
    oneLiner = c > 0
      ? `Warm. ${c} take${c === 1 ? "" : "s"} so far. Early intel coming in.`
      : `Warm. Early intel coming in.`;
  } else {
    oneLiner = `Cold. Nobody's spilled here yet — be the first 👀`;
  }

  return {
    tempF: Math.round(tempF),
    tier, tierLabel, tierEmoji,
    oneLiner, color, needleDeg,
    isLive: tier === "hot" || tier === "boiling",
  };
}

// ─── Hero gauge — listing detail page ──────────────────────

interface TeaTemperatureProps extends TeaTempInput {
  /** Optional AI-generated verdict ("Boiling. 47 takes…"). Falls back to computed one-liner. */
  verdict?: string;
  /** Optional listing label shown above the gauge. */
  listingAddress?: string;
  /** Click → opens Spill / scrolls to comments. */
  onSpill?: () => void;
  /** Compact mode for embed in narrow contexts. */
  compact?: boolean;
}

export default function TeaTemperature({
  verdict,
  listingAddress,
  onSpill,
  compact = false,
  ...input
}: TeaTemperatureProps) {
  const result = useMemo(() => computeTeaTemp(input), [
    input.commentCount, input.hotCount, input.redFlagCount,
    input.recentCount, input.uniqueCommenters,
  ]);

  // Sweep needle in on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const sweepDeg = mounted ? result.needleDeg : -90;

  return (
    <section
      className={`relative overflow-hidden rounded-card border ${
        result.isLive ? "border-tea-500/40" : "border-divider"
      } bg-surface ${compact ? "p-4 sm:p-5" : "p-5 sm:p-7"}`}
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(255,46,147,0.12) 0%, transparent 55%), #181221",
      }}
      aria-label={`Tea Temperature: ${result.tempF} degrees, ${result.tierLabel}`}
    >
      {/* ambient breathing glow behind the gauge */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 pointer-events-none animate-tea-shimmer"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${result.color}33 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex flex-col gap-4 sm:gap-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="tea-pill" style={{ borderColor: `${result.color}66`, color: result.color, background: `${result.color}14` }}>
              <span aria-hidden>{result.tierEmoji}</span>
              <span className="font-bold tracking-wider uppercase">Tea Temp</span>
            </span>
            {listingAddress && !compact && (
              <span className="truncate text-caption text-secondary">on {listingAddress}</span>
            )}
          </div>

          {result.isLive && (
            <span className="flex items-center gap-1.5 text-tag uppercase tracking-wider text-lime-300">
              <span className="live-dot" />
              <span>Live</span>
            </span>
          )}
        </div>

        {/* Gauge + temperature */}
        <div className="flex items-end gap-5 sm:gap-7">
          {/* Half-circle gauge */}
          <div className={`relative ${compact ? "w-32 h-16" : "w-44 h-22 sm:w-52 sm:h-26"} shrink-0`} aria-hidden>
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient id="teaTempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#5EEAD4" />
                  <stop offset="40%"  stopColor="#FF7DBC" />
                  <stop offset="75%"  stopColor="#FF2E93" />
                  <stop offset="100%" stopColor="#C8FF3E" />
                </linearGradient>
              </defs>
              {/* Track */}
              <path
                d="M 16 100 A 84 84 0 0 1 184 100"
                fill="none"
                stroke="rgba(255,247,232,0.08)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Filled gradient arc, clipped to the temperature */}
              <path
                d="M 16 100 A 84 84 0 0 1 184 100"
                fill="none"
                stroke="url(#teaTempGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * (result.tempF / 212))}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
              {/* Needle */}
              <g
                style={{
                  transformOrigin: "100px 100px",
                  transform: `rotate(${sweepDeg}deg)`,
                  transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <line x1="100" y1="100" x2="100" y2="22" stroke={result.color} strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill={result.color} />
                <circle cx="100" cy="100" r="2" fill="#0F0A14" />
              </g>
            </svg>
          </div>

          {/* Reading */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display ${compact ? "text-display" : "text-mega"} leading-none`}
                style={{ color: result.color }}
              >
                {result.tempF}
              </span>
              <span className={`${compact ? "text-headline" : "text-display"} font-display text-secondary leading-none`}>
                °F
              </span>
            </div>
            <p className={`${compact ? "text-body" : "text-title"} text-ink mt-1 font-semibold`}>
              {result.tierLabel}.
            </p>
          </div>
        </div>

        {/* One-line verdict */}
        <p className={`text-secondary ${compact ? "text-caption" : "text-body"} leading-relaxed`}>
          {verdict || result.oneLiner}
        </p>

        {/* CTA */}
        {onSpill && (
          <button
            type="button"
            onClick={onSpill}
            className="tea-button w-full py-3 text-base"
          >
            {result.tier === "cold"
              ? "🫖 Be the first to spill"
              : result.tier === "boiling"
                ? "🌶️ Add to the boil"
                : "🫖 Drop your take"}
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Compact pill — for listing cards ──────────────────────

interface TeaTempPillProps extends TeaTempInput {
  className?: string;
}

export function TeaTempPill(props: TeaTempPillProps) {
  const { className, ...input } = props;
  const r = useMemo(() => computeTeaTemp(input), [
    input.commentCount, input.hotCount, input.redFlagCount,
    input.recentCount, input.uniqueCommenters,
  ]);
  if (r.tempF === 0) {
    return (
      <span className={`tea-pill ${className ?? ""}`} aria-label="Tea Temperature: cold, no takes yet">
        <span aria-hidden>🧊</span>
        <span>Cold</span>
      </span>
    );
  }
  const cls =
    r.tier === "boiling" ? "tea-pill tea-pill--boil" :
    r.tier === "hot"     ? "tea-pill tea-pill--hot" :
    r.tier === "warm"    ? "tea-pill" :
                           "tea-pill tea-pill--mint";
  return (
    <span
      className={`${cls} ${className ?? ""}`}
      aria-label={`Tea Temperature: ${r.tempF} degrees, ${r.tierLabel}`}
      title={r.oneLiner}
    >
      <span aria-hidden>{r.tierEmoji}</span>
      <span className="font-bold tabular-nums">{r.tempF}°F</span>
      <span className="opacity-80">{r.tierLabel}</span>
    </span>
  );
}
