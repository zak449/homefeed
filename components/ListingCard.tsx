"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

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
};

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const photos = listing.photos;
  const hasMultiple = photos.length > 1;
  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;

  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  const specParts: string[] = [];
  if (listing.bedrooms != null) specParts.push(`${listing.bedrooms} bd`);
  if (listing.bathrooms != null) specParts.push(`${listing.bathrooms} ba`);
  if (listing.sqft != null) specParts.push(`${listing.sqft.toLocaleString()} sf`);
  const specs = specParts.join(" \u00B7 ");

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    },
    [photos.length]
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    },
    [photos.length]
  );

  const swipedRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swipedRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = Math.abs(touchStartX.current - e.touches[0].clientX);
    if (diff > 30) {
      // Horizontal swipe detected — prevent link navigation
      swipedRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        swipedRef.current = true;
        if (diff > 0) {
          setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
        } else {
          setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
        }
      }
      touchStartX.current = null;
    },
    [photos.length]
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      swipedRef.current = false;
    }
  }, []);

  const currentPhoto = photos[currentIndex] ?? null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden bg-surface border border-divider hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 cursor-pointer"
    >
      {/* ── CLEAN IMAGE — no text overlays except minimal badge ── */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-highlight"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchMove={hasMultiple ? handleTouchMove : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        onClick={hasMultiple ? handleClick : undefined}
      >
        {currentPhoto ? (
          <FallbackImage
            src={currentPhoto}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-highlight">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-tertiary/30">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
        )}

        {/* Arrows — only on hover */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface/90 text-white shadow-soft sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-elevated"
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface/90 text-white shadow-soft sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-elevated"
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}

        {/* Dots — clean, bottom center */}
        {hasMultiple && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {(photos.length <= 5 ? photos : photos.slice(0, 5)).map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all ${
                  (photos.length <= 5 ? i === currentIndex : (i < 4 ? i === currentIndex : currentIndex >= 4))
                    ? "bg-white !w-1.5 sm:!w-2 shadow-sm"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Single small badge — top left only */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${
            isRent ? "bg-blue-500/90 text-white" : "bg-surface/90 text-white shadow-sm"
          }`}>
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>
      </div>

      {/* ── DETAILS BELOW IMAGE — clean, readable ── */}
      <div className="p-3.5">
        {/* Price + specs row */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-[15px] sm:text-[1.05rem] font-bold text-ink tracking-tight leading-none">
            {price}
          </p>
          {specs && (
            <p className="text-xs sm:text-xs text-secondary font-medium shrink-0">
              {specs}
            </p>
          )}
        </div>

        {/* Address */}
        <p className="text-sm sm:text-sm text-ink/80 truncate leading-tight">
          {listing.address}, {listing.city}
        </p>

        {/* Comment / social layer */}
        {listing.topComment ? (
          <div className="mt-3 pt-3 border-t border-divider">
            <p className="text-sm text-ink leading-snug line-clamp-2 font-bold">
              {listing.topComment.content}
            </p>
            <p className="text-xs text-secondary mt-1.5">
              &mdash; {formatName(listing.topComment.name)}
              {commentCount > 1 && <span className="text-secondary ml-1">+ {commentCount - 1} more</span>}
            </p>
            {/* Reaction row — always visible */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {["🚩", "💸", "👀", "🔥", "💀"].map((emoji) => (
                <span key={emoji} className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-highlight/50 border border-divider/30 text-tertiary font-medium">
                  <span>{emoji}</span>
                  <span className="tabular-nums">0</span>
                </span>
              ))}
            </div>
            <div className="mt-3 w-full py-2.5 bg-amber text-white text-sm font-bold rounded-lg text-center group-hover:bg-amber/90 transition-colors">
              🫖 Spill the tea &rarr;
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-divider">
            {/* Reaction row — always visible */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {["🚩", "💸", "👀", "🔥", "💀"].map((emoji) => (
                <span key={emoji} className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-highlight/50 border border-divider/30 text-tertiary font-medium">
                  <span>{emoji}</span>
                  <span className="tabular-nums">0</span>
                </span>
              ))}
            </div>
            <div className="w-full py-2.5 bg-amber text-white text-sm font-bold rounded-lg text-center group-hover:bg-amber/90 transition-colors">
              🫖 Spill the tea &rarr;
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
