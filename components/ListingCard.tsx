"use client";

/**
 * ListingCard — calm-and-premium rewrite.
 *
 * Design principles (per docs/UI_CRITIQUE.md):
 *   - One big photo. One big quote. One big button.
 *   - Hide noise: no all-zero reaction rows, no triple-CTAs, no five-dot
 *     carousels that lie about photo count.
 *   - Every interaction earns a tiny "wow": hover ken-burns, scroll-in dial
 *     sweep, swipe-up "drill deeper" gesture.
 *
 * The public prop shape is unchanged from the previous card so every caller
 * (`SmartListingFeed`, `app/saved`, `app/city/[slug]`, etc.) keeps working.
 * Two purely-additive optional props (`index`, `comments`) drive entry
 * stagger + a pre-warmed DrillDeeper, respectively.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import DrillDeeper, {
  type DrillDeeperComment,
} from "@/components/DrillDeeper";
import { computeTeaTemp } from "@/components/TeaTemperature";
import useSwipeUp from "@/lib/hooks/useSwipeUp";

// ─── Types ─────────────────────────────────────────────────

type Listing = {
  id: string;
  address: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  price: number;
  listingType: string;
  propertyType: string;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  photos: string[];
  agentName?: string | null;
  createdAt?: Date | string;
  _count?: { comments: number };
  topComment?: { name: string; content: string } | null;
  /** Map of reaction emoji → count. When absent, the row hides for zero-state. */
  reactionCounts?: Record<string, number>;
};

interface ListingCardProps {
  listing: Listing;
  /** Position in the feed — drives staggered entry animation. */
  index?: number;
  /** Optional pre-fetched comments for the DrillDeeper modal. */
  comments?: DrillDeeperComment[];
}

// ─── Helpers ───────────────────────────────────────────────

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// ─── Component ─────────────────────────────────────────────

export default function ListingCard({
  listing,
  index = 0,
  comments,
}: ListingCardProps) {
  const [drillOpen, setDrillOpen] = useState(false);
  const [tempVisible, setTempVisible] = useState(false);
  const [animatedTemp, setAnimatedTemp] = useState(0);
  const cardRef = useRef<HTMLElement | null>(null);
  const swipeContainerRef = useRef<HTMLDivElement | null>(null);

  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;

  const heroPhoto = listing.photos[0] ?? null;

  // Tea temperature — derived from comment volume + reaction signal. Cheap
  // heuristic so we don't have to query — this is the "card-level" gauge.
  const reactionEntries = useMemo(
    () =>
      Object.entries(listing.reactionCounts ?? {})
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1]),
    [listing.reactionCounts],
  );
  const totalReactions = reactionEntries.reduce((acc, [, n]) => acc + n, 0);

  const tea = useMemo(
    () =>
      computeTeaTemp({
        commentCount,
        // Use total reactions as a proxy for hotness — only the "is something
        // happening here?" signal is needed at card scale.
        hotCount: Math.min(commentCount, Math.floor(totalReactions / 3)),
        recentCount: commentCount,
        uniqueCommenters: Math.min(commentCount, 3),
      }),
    [commentCount, totalReactions],
  );

  // Show the temp dial only when there's real signal.
  const showTemp = tea.tempF >= 30 && commentCount > 0;

  // Animate gauge from 0 → score the first time the card enters the viewport.
  useEffect(() => {
    if (!showTemp) return;
    const el = cardRef.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTempVisible(true);
      setAnimatedTemp(tea.tempF);
      return;
    }

    let raf = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTempVisible(true);
            obs.disconnect();
            // Tween from 0 → tea.tempF over ~900ms (ease-out cubic).
            const start = performance.now();
            const duration = 900;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setAnimatedTemp(Math.round(tea.tempF * eased));
              if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showTemp, tea.tempF]);

  // Swipe-up gesture → open DrillDeeper
  const { swiping, progress, bind } = useSwipeUp({
    threshold: 100,
    fractionThreshold: 0.4,
    onSwipeUp: useCallback(() => setDrillOpen(true), []),
    disabled: drillOpen,
  });

  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const specParts: string[] = [];
  if (listing.bedrooms != null) specParts.push(`${listing.bedrooms} bd`);
  if (listing.bathrooms != null) specParts.push(`${listing.bathrooms} ba`);
  if (listing.sqft != null)
    specParts.push(`${listing.sqft.toLocaleString()} sqft`);
  const specs = specParts.join(" · ");

  // Card-rise stagger is delivered via CSS variable from the parent feed.
  // We don't compute the delay here — globals.css multiplies by 60ms.

  const openDrillDeeper = useCallback(
    (e: ReactMouseEvent) => {
      // Defensive: the button now lives outside the <Link>, but stopping
      // propagation is harmless and protects against future restructuring
      // (e.g. wrapping the whole card with a card-level click handler).
      e.stopPropagation();
      setDrillOpen(true);
    },
    [],
  );

  // Subtle vertical lift while the user is mid-swipe — telegraphs "yes,
  // something is happening" without committing to anything.
  const swipeStyle: CSSProperties =
    swiping && progress > 0
      ? {
          transform: `translateY(${-Math.min(14, progress * 16)}px)`,
          transition: "transform 0ms linear",
        }
      : {
          transform: "translateY(0)",
          transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        };

  // Listing payload that DrillDeeper needs (subset of Listing).
  const drillListing = useMemo(
    () => ({
      id: listing.id,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      photos: listing.photos,
      price: listing.price,
      listingType: listing.listingType,
    }),
    [
      listing.id,
      listing.address,
      listing.city,
      listing.state,
      listing.photos,
      listing.price,
      listing.listingType,
    ],
  );

  return (
    <>
      <article
        ref={cardRef}
        className="lc-card-rise group relative block"
        // Parent feeds set `--card-index` on the wrapper for the staggered rise;
        // we also set it here as a fallback so callers that mount the card
        // directly (saved/, city/) still get a sensible cascade via the
        // `index` prop. The parent wrapper wins by CSS specificity since
        // both end up in the cascade — but identical values are safe.
        style={{ "--card-index": index } as CSSProperties}
      >
        <div
          ref={swipeContainerRef}
          {...bind}
          style={swipeStyle}
          className="rounded-2xl overflow-hidden bg-surface border border-divider/60 group-hover:border-amber/40 group-hover:shadow-lg group-hover:shadow-amber/5 focus-within:border-amber transition-all duration-300"
        >
          <Link
            href={`/listing/${listing.id}`}
            className="block focus-visible:outline-none cursor-pointer"
            aria-label={`${listing.address}, ${listing.city} — ${price}`}
          >
            {/* ── Photo — the entire emotional canvas ───────── */}
            <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden bg-highlight">
              {heroPhoto ? (
                <FallbackImage
                  src={heroPhoto}
                  alt={listing.address}
                  className="lc-photo absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-highlight">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-tertiary/30"
                    aria-hidden="true"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}

              {/* Type badge (top-left) */}
              <div className="absolute top-3 left-3 z-10">
                <span
                  className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
                    isRent
                      ? "bg-blue-500/90 text-white"
                      : "bg-white/90 text-bg"
                  }`}
                >
                  {isRent ? "Rent" : "Sale"}
                </span>
              </div>

              {/* Tea Temperature gauge (top-right) — only when there's heat */}
              {showTemp && (
                <TeaDial
                  tempF={animatedTemp}
                  targetTempF={tea.tempF}
                  color={tea.color}
                  visible={tempVisible}
                  tierLabel={tea.tierLabel}
                />
              )}

              {/* Bottom gradient scrim + quote OR "be the first" affordance */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none bg-gradient-to-t from-black/90 via-black/55 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                {listing.topComment ? (
                  <figure>
                    <blockquote className="text-white text-lg sm:text-xl font-semibold italic leading-snug line-clamp-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                      &ldquo;{listing.topComment.content}&rdquo;
                    </blockquote>
                    <figcaption className="mt-2 text-[12px] text-white/85 font-medium tracking-wide">
                      &mdash; {formatName(listing.topComment.name)}
                      {commentCount > 1 && (
                        <span className="text-white/65 ml-1.5">
                          &middot; +{commentCount - 1} more
                        </span>
                      )}
                    </figcaption>
                  </figure>
                ) : (
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-base"
                    >
                      🫖
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-sm sm:text-base font-bold leading-tight">
                        Be the first to spill
                      </p>
                      <p className="text-white/75 text-xs">
                        No takes here yet — set the tone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile swipe hint — only while the user has begun a swipe */}
              {swiping && progress > 0.15 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-3 flex justify-center pointer-events-none"
                  style={{ opacity: Math.min(1, progress) }}
                >
                  <span className="px-3 py-1 rounded-full bg-amber/95 text-white text-[11px] font-bold uppercase tracking-[0.16em] shadow-lg">
                    Release to dive deeper
                  </span>
                </div>
              )}
            </div>

            {/* ── Spec row — calm, single line ───────── */}
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <p className="text-[17px] sm:text-[1.15rem] font-bold text-ink tracking-tight leading-none">
                  {price}
                </p>
                {specs && (
                  <p className="text-xs text-secondary font-medium shrink-0 tabular-nums">
                    {specs}
                  </p>
                )}
              </div>
              <p className="text-sm text-ink/80 truncate leading-tight">
                {listing.address}
                <span className="text-secondary">, {listing.city}</span>
              </p>
            </div>
          </Link>

          {/* The reactions + primary CTA sit OUTSIDE the link — buttons
              must not be nested inside an <a>. They share the card's
              hover halo via the parent `.group` class. */}
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            {/* Slack-style reaction chips — only when there's signal */}
            {reactionEntries.length > 0 ? (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {reactionEntries.slice(0, 5).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-highlight/60 border border-divider/50 text-ink/90 font-medium hover:border-amber/40 transition-colors"
                  >
                    <span aria-hidden="true">{emoji}</span>
                    <span className="tabular-nums">{count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-highlight/40 border border-divider/40 text-secondary font-medium">
                  <span aria-hidden="true">👀</span>
                  <span>React</span>
                </span>
              </div>
            )}

            {/* The single primary CTA — uses the unified "Spill the tea →" copy. */}
            <button
              type="button"
              onClick={openDrillDeeper}
              className="mt-4 w-full py-3 min-h-[44px] flex items-center justify-center gap-1 bg-amber text-white text-sm font-bold rounded-xl group-hover:bg-amber/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              aria-label={`Spill the tea on ${listing.address}`}
            >
              <span aria-hidden="true" className="mr-0.5">
                🫖
              </span>
              Spill the tea
              <span aria-hidden="true" className="ml-0.5">
                &rarr;
              </span>
            </button>
          </div>
        </div>
      </article>

      {/* Drill-deeper full-screen take stream */}
      <DrillDeeper
        isOpen={drillOpen}
        onClose={() => setDrillOpen(false)}
        listing={drillListing}
        comments={comments}
      />
    </>
  );
}

// ─── Tea dial — a small circular gauge that lives on the photo ─

interface TeaDialProps {
  tempF: number;
  targetTempF: number;
  color: string;
  visible: boolean;
  tierLabel: string;
}

function TeaDial({
  tempF,
  targetTempF,
  color,
  visible,
  tierLabel,
}: TeaDialProps) {
  // The ring is a 32-radius circle (circumference ≈ 201.06). We fill it
  // proportional to the displayed temperature so it animates with the number.
  const R = 32;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, tempF / 212));
  const dashOffset = C * (1 - pct);

  return (
    <div
      className="absolute top-3 right-3 z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 400ms ease, transform 400ms ease",
      }}
    >
      <div
        className="relative w-[56px] h-[56px] rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-lg flex items-center justify-center"
        title={`Tea Temperature: ${targetTempF}°F — ${tierLabel}`}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 72 72"
          className="absolute inset-0"
        >
          {/* Track */}
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="4"
          />
          {/* Fill */}
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dashoffset 200ms linear" }}
          />
        </svg>
        <span
          className="relative font-bold tabular-nums text-white text-[15px] leading-none"
          style={{ color }}
        >
          {tempF}
        </span>
      </div>
    </div>
  );
}
