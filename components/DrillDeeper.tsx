"use client";

/**
 * DrillDeeper — the full-screen "swipe up to dive deeper" take stream.
 *
 * Opens when a user swipes up on a ListingCard (mobile) or taps the primary
 * "Spill the tea →" CTA (any platform). Shows the listing's hero photo as
 * a blurred backdrop with every comment rendered as an Instagram-Story-style
 * card stacked vertically. A composer is pinned to the bottom so the next
 * take is always one tap away.
 *
 * Comments are passed in if available; otherwise the modal lazily fetches
 * them from `/api/comments?listingId=…` when it opens.
 *
 * Motion: take cards stagger-fade in via `.dd-take-rise`. Reduced-motion
 * users see them statically. Swipe down to dismiss on mobile, Escape on
 * desktop, click the chevron-down at the top anywhere.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

// ─── Types ─────────────────────────────────────────────────

export interface DrillDeeperComment {
  id: string;
  name: string;
  content: string;
  createdAt: Date | string;
  /** Map of emoji → count. Optional. */
  reactions?: Record<string, number>;
  role?: string | null;
}

export interface DrillDeeperListing {
  id: string;
  address: string;
  city: string;
  state: string;
  photos: string[];
  price: number;
  listingType?: string;
}

interface DrillDeeperProps {
  isOpen: boolean;
  onClose: () => void;
  listing: DrillDeeperListing;
  /** Pre-supplied comments. If omitted, the modal fetches on open. */
  comments?: DrillDeeperComment[];
  /** Called when the user submits a take via the inline composer. */
  onSpill?: () => void;
}

// ─── Helpers ───────────────────────────────────────────────

function timeAgo(d: Date | string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / 604800)}w`;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// ─── Component ─────────────────────────────────────────────

export default function DrillDeeper({
  isOpen,
  onClose,
  listing,
  comments,
  onSpill,
}: DrillDeeperProps) {
  // Defer mounting the modal until first open — keeps the feed light.
  // Once opened, we keep it mounted so the close transition can play.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  const [fetched, setFetched] = useState<DrillDeeperComment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Drag-to-dismiss state
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Lazy fetch comments only when we open and don't already have them.
  useEffect(() => {
    if (!isOpen) return;
    if (comments && comments.length > 0) return;
    if (fetched) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/comments?listingId=${encodeURIComponent(listing.id)}`)
      .then((r) => (r.ok ? r.json() : { comments: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.comments) ? data.comments : [];
        setFetched(
          list.map(
            (c: {
              id: string;
              name: string;
              content: string;
              createdAt: string;
              reactions?: Record<string, number>;
              role?: string;
            }) => ({
              id: c.id,
              name: c.name,
              content: c.content,
              createdAt: c.createdAt,
              reactions: c.reactions,
              role: c.role ?? null,
            }),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setFetched([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, comments, fetched, listing.id]);

  // Body scroll lock + focus the close button when opened
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset draft + drag when closing
  useEffect(() => {
    if (!isOpen) {
      setDraft("");
      setDragOffset(0);
      setDragging(false);
      dragStartY.current = null;
    }
  }, [isOpen]);

  // Swipe-down-to-dismiss handlers (mobile)
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Only treat as drag when touch starts in the top "handle" zone
      // OR when the scroller is already at top — prevents stealing scroll.
      const sheet = sheetRef.current;
      const target = e.target as HTMLElement;
      const scrollEl = sheet?.querySelector<HTMLElement>("[data-dd-scroll]");
      const atTop = !scrollEl || scrollEl.scrollTop <= 2;
      const fromHandle = target.closest("[data-dd-handle]") != null;
      if (atTop || fromHandle) {
        dragStartY.current = e.touches[0]?.clientY ?? null;
      } else {
        dragStartY.current = null;
      }
    },
    [],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = (e.touches[0]?.clientY ?? 0) - dragStartY.current;
    if (dy > 0) {
      // Add a touch of resistance — feels like a real sheet.
      const eased = dy < 60 ? dy : 60 + (dy - 60) * 0.55;
      setDragOffset(eased);
      setDragging(true);
    } else {
      setDragOffset(0);
      setDragging(false);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragStartY.current === null) {
      setDragOffset(0);
      setDragging(false);
      return;
    }
    if (dragOffset > 120) {
      // commit dismiss
      onClose();
    }
    setDragOffset(0);
    setDragging(false);
    dragStartY.current = null;
  }, [dragOffset, onClose]);

  const resolved = comments && comments.length > 0 ? comments : fetched ?? [];
  const sorted = useMemo(
    () =>
      [...resolved].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [resolved],
  );

  const heroPhoto = listing.photos[0] ?? null;
  const priceLabel =
    listing.listingType === "rent"
      ? `$${listing.price.toLocaleString()}/mo`
      : `$${listing.price.toLocaleString()}`;

  // Smooth opacity tied to drag — premium drag feedback
  const dragAlpha = Math.max(0, 1 - dragOffset / 400);

  // Don't render anything (or read DOM) until the modal has been opened at
  // least once. After that, keep it mounted so close transitions can play.
  if (!mounted) return null;

  return (
    <div
      className={`dd-overlay fixed inset-0 z-[120] flex flex-col ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label={`Takes on ${listing.address}`}
      style={{
        opacity: isOpen ? dragAlpha : 0,
        transition: dragging ? "none" : "opacity 240ms ease",
      }}
    >
      {/* Background photo, blurred + dimmed */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-bg">
        {heroPhoto ? (
          <FallbackImage
            src={heroPhoto}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95" />
      </div>

      {/* Foreground sheet — slides up on iOS, fades on desktop */}
      <div
        ref={sheetRef}
        className={`relative flex flex-col h-full max-h-[100dvh] transition-transform ${
          dragging ? "duration-0" : "duration-300"
        } ease-out`}
        style={{
          transform: isOpen
            ? `translateY(${dragOffset}px)`
            : "translateY(40px)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Top affordance: handle + close + summary */}
        <header className="shrink-0 px-4 pt-3 pb-3 sm:px-6">
          <div
            data-dd-handle
            className="mx-auto w-12 h-1.5 rounded-full bg-white/30 mb-3"
            aria-hidden="true"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60 font-semibold">
                Takes on
              </p>
              <Link
                href={`/listing/${listing.id}`}
                onClick={onClose}
                className="text-white text-lg sm:text-xl font-bold truncate hover:text-amber transition-colors block"
              >
                {listing.address}
              </Link>
              <p className="text-xs text-white/70 mt-0.5 truncate">
                {listing.city}, {listing.state} &middot;{" "}
                <span className="text-amber font-semibold">{priceLabel}</span>
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white/90 transition-colors"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Take stream */}
        <div
          data-dd-scroll
          className="flex-1 overflow-y-auto px-4 sm:px-6 pb-[160px] scrollbar-none"
        >
          {loading && sorted.length === 0 && (
            <div className="py-12 text-center text-white/60 text-sm">
              Pulling the latest takes…
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3" aria-hidden="true">
                🫖
              </div>
              <p className="text-white text-base font-semibold mb-1">
                No takes yet.
              </p>
              <p className="text-white/60 text-sm max-w-xs">
                You&apos;re first in line. Drop something the listing photos
                won&apos;t tell anyone.
              </p>
            </div>
          )}

          <ul className="space-y-3 max-w-2xl mx-auto">
            {sorted.map((c, i) => (
              <li
                key={c.id}
                className="dd-take-rise rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md p-4 sm:p-5 shadow-lg"
                style={
                  {
                    "--take-index": i,
                  } as CSSProperties
                }
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-white truncate">
                    {formatName(c.name)}
                    {c.role && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-amber/90 bg-amber/15 border border-amber/30 px-1.5 py-0.5 rounded-full align-middle font-bold">
                        {c.role}
                      </span>
                    )}
                  </p>
                  <span className="text-[11px] text-white/50 shrink-0">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
                {c.reactions && Object.keys(c.reactions).length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {Object.entries(c.reactions)
                      .filter(([, n]) => n > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([emoji, n]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs text-white/90 font-medium"
                        >
                          <span aria-hidden="true">{emoji}</span>
                          <span className="tabular-nums">{n}</span>
                        </span>
                      ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Pinned composer */}
        <div
          className="absolute inset-x-0 bottom-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom,12px),12px)] sm:px-6 bg-gradient-to-t from-black/95 via-black/85 to-transparent"
          aria-label="Spill yours"
        >
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <label htmlFor="dd-composer" className="sr-only">
              Spill yours
            </label>
            <textarea
              id="dd-composer"
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 500))}
              rows={1}
              placeholder="Spill yours…"
              className="flex-1 resize-none rounded-2xl bg-white/[0.08] border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-amber/60 focus:bg-white/[0.12] transition-colors max-h-[120px]"
            />
            <button
              type="button"
              onClick={() => {
                if (!draft.trim()) return;
                onSpill?.();
                // Hand off to the parent's spill flow — let it persist.
                setDraft("");
              }}
              disabled={!draft.trim()}
              className="shrink-0 h-11 px-4 rounded-2xl bg-amber text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber/90 transition-colors"
            >
              Spill
              <span aria-hidden="true" className="ml-1">
                &rarr;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
