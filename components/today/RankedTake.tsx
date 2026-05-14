/**
 * RankedTake — one row in the /today list of top takes.
 *
 * Server component. The big rank number is the magnetic element; #1 gets a
 * drop-cap-style serif treatment on the take content. Each card links into
 * the listing detail page via "Open the spill".
 *
 * Reduced-motion: the card-rise stagger is delivered via the existing global
 * `.lc-card-rise` utility (already disabled under prefers-reduced-motion in
 * globals.css). We only set --card-index; we don't add any local animation.
 */

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import type { CSSProperties } from "react";

export interface RankedTakeInput {
  id: string;
  rank: number;
  content: string;
  authorName: string;
  createdAt: Date | string;
  isRedFlag: boolean;
  likeCount: number;
  reactionCount: number;
  heatScore: number;
  listing: {
    id: string;
    address: string;
    city: string;
    state: string;
    price: number;
    listingType: string;
    photo: string | null;
  };
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name || "Anonymous";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function fmtPrice(p: number, t: string): string {
  return t === "rent" ? `$${p.toLocaleString()}/mo` : `$${p.toLocaleString()}`;
}

function timeAgo(d: Date | string): string {
  const t = typeof d === "string" ? Date.parse(d) : d.getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

function flameTier(heat: number): string {
  if (heat >= 30) return "🔥🔥🔥";
  if (heat >= 15) return "🔥🔥";
  if (heat >= 5) return "🔥";
  return "·";
}

export default function RankedTake({ take }: { take: RankedTakeInput }) {
  const isPodium = take.rank <= 3;
  const isFirst = take.rank === 1;

  // Rank color: top-3 hot, the rest neutral.
  const rankColor = isFirst
    ? "text-amber"
    : take.rank === 2
      ? "text-accent-warm"
      : take.rank === 3
        ? "text-amber/70"
        : "text-tertiary/60";

  // Strip a leading [role] tag the same way the homepage does.
  const cleaned = take.content.replace(/^\[([^\]]+)\]\s*/, "");

  return (
    <article
      className="lc-card-rise relative rounded-2xl bg-surface border border-divider/60 hover:border-amber/30 transition-colors overflow-hidden"
      style={{ "--card-index": take.rank } as CSSProperties}
    >
      <div className="flex items-stretch">
        {/* Rank gutter */}
        <div
          className={`shrink-0 w-14 sm:w-20 flex items-start justify-center pt-4 sm:pt-5 ${rankColor}`}
          aria-hidden="true"
        >
          <span
            className={`font-display tabular-nums ${
              isFirst
                ? "text-[3.25rem] sm:text-[4rem] leading-none"
                : isPodium
                  ? "text-[2.5rem] sm:text-[3rem] leading-none"
                  : "text-[1.75rem] sm:text-[2rem] leading-none"
            }`}
            style={
              isFirst
                ? { textShadow: "0 0 24px rgba(255,77,0,0.35)" }
                : undefined
            }
          >
            #{take.rank}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 py-4 pr-4 sm:py-5 sm:pr-5">
          {/* The take */}
          <p
            className={`italic text-ink leading-snug ${
              isFirst
                ? "text-xl sm:text-[1.6rem] font-semibold first-letter:font-display first-letter:not-italic first-letter:float-left first-letter:text-[3.5rem] first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-amber"
                : isPodium
                  ? "text-lg font-medium"
                  : "text-base"
            }`}
            style={{ fontFamily: "'Iowan Old Style', Georgia, 'Times New Roman', serif" }}
          >
            {isFirst ? cleaned : `“${cleaned}”`}
          </p>

          {/* Author + meta pill row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-highlight/60 border border-divider text-ink font-bold">
              {formatName(take.authorName)}
            </span>
            <span className="text-tertiary">·</span>
            <span className="text-secondary truncate">
              {take.listing.city}, {take.listing.state}
            </span>
            <span className="text-tertiary">·</span>
            <span className="text-tertiary tabular-nums">
              {timeAgo(take.createdAt)} ago
            </span>
            {take.isRedFlag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-flag/15 border border-red-flag/30 text-red-flag font-bold">
                <span aria-hidden="true">🚩</span> Red flag
              </span>
            )}
          </div>

          {/* Mini listing context */}
          <Link
            href={`/listing/${take.listing.id}`}
            className="mt-3 flex items-center gap-3 group rounded-xl bg-bg/40 border border-divider/40 p-2.5 hover:border-amber/30 transition-colors"
            aria-label={`Open ${take.listing.address}`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-highlight shrink-0">
              {take.listing.photo ? (
                <FallbackImage
                  src={take.listing.photo}
                  alt={take.listing.address}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading={take.rank <= 3 ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate leading-tight">
                {take.listing.address.split(",")[0]}
              </p>
              <p className="text-xs text-secondary tabular-nums">
                {fmtPrice(take.listing.price, take.listing.listingType)}
              </p>
            </div>
            <span className="text-xs font-bold text-amber whitespace-nowrap">
              <span aria-hidden="true">🫖</span> Open the spill →
            </span>
          </Link>

          {/* Heat row */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-tertiary">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">{flameTier(take.heatScore)}</span>
              <span className="tabular-nums">heat {Math.round(take.heatScore)}</span>
            </span>
            <span className="tabular-nums">
              ♥ {take.likeCount} · {take.reactionCount} reactions
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
