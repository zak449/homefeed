"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FallbackImage from "@/components/FallbackImage";

export default function PhotoLightbox({
  photos,
  address,
}: {
  photos: string[];
  address: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchDelta = useRef(0);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  // Track mobile carousel scroll position for dot indicators
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (el) {
            const scrollLeft = el.scrollLeft;
            const width = el.clientWidth;
            const newIndex = Math.round(scrollLeft / width);
            setMobileIndex(newIndex);
          }
          ticking = false;
        });
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  // Touch swipe for lightbox
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchDelta.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current.x;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current) return;
    const threshold = 50;
    if (touchDelta.current < -threshold) {
      next();
    } else if (touchDelta.current > threshold) {
      prev();
    }
    touchStart.current = null;
    touchDelta.current = 0;
  }, [next, prev]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* === Mobile: horizontal snap-scroll carousel === */}
      <div className="sm:hidden">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-xl"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => openAt(i)}
              className="flex-none w-full relative aspect-[4/3] bg-tag cursor-pointer snap-center"
            >
              <FallbackImage
                src={p}
                alt={`${address} photo ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        {/* Dot indicators */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === mobileIndex
                    ? "w-1.5 h-1.5 bg-ink"
                    : "w-1 h-1 bg-tertiary/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* === Desktop: full masonry-like grid === */}
      <div className="hidden sm:block">
        {photos.length === 1 ? (
          <button
            onClick={() => openAt(0)}
            className="w-full relative aspect-[16/9] rounded-xl overflow-hidden bg-tag cursor-pointer"
          >
            <FallbackImage
              src={photos[0]}
              alt={address}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 rounded-xl overflow-hidden">
            {/* Hero photo: 2 cols x 2 rows */}
            <button
              onClick={() => openAt(0)}
              className="col-span-2 row-span-2 relative aspect-auto min-h-[260px] bg-tag cursor-pointer"
            >
              <FallbackImage
                src={photos[0]}
                alt={address}
                className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </button>
            {/* Remaining photos fill the 4-col grid */}
            {photos.slice(1).map((p, i) => (
              <button
                key={i}
                onClick={() => openAt(i + 1)}
                className="relative aspect-[4/3] bg-tag cursor-pointer"
              >
                <FallbackImage
                  src={p}
                  alt={`${address} photo ${i + 2}`}
                  className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === Lightbox overlay === */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light z-10 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
            aria-label="Close lightbox"
          >
            &times;
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium z-10">
            {index + 1} / {photos.length}
          </div>

          {/* Previous — hidden on mobile (swipe instead) */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 w-12 h-12 items-center justify-center"
              aria-label="Previous photo"
            >
              &#8249;
            </button>
          )}

          {/* Next — hidden on mobile (swipe instead) */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 w-12 h-12 items-center justify-center"
              aria-label="Next photo"
            >
              &#8250;
            </button>
          )}

          {/* Photo */}
          <FallbackImage
            src={photos[index]}
            alt={`${address} photo ${index + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
