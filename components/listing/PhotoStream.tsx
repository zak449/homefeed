"use client";

/**
 * PhotoStream — full-bleed horizontal swipe carousel.
 *
 * Photos aren't thumbnails. Each one is a full-width snap target with a
 * "3 / 12" counter pill bottom-right. Tapping a photo opens the lightbox
 * (delegated to PhotoLightbox via prop pattern? we keep this self-contained
 * by exposing onOpen).
 */

import { useEffect, useRef, useState } from "react";
import FallbackImage from "@/components/FallbackImage";

interface Props {
  photos: string[];
  address: string;
  onOpenAt?: (index: number) => void;
}

export default function PhotoStream({ photos, address, onOpenAt }: Props) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (el) {
          const next = Math.round(el.scrollLeft / el.clientWidth);
          setIndex(next);
        }
        ticking = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (photos.length === 0) return null;

  return (
    <section aria-label="Photos of this property" className="relative">
      <div className="flex items-baseline justify-between px-4 sm:px-6 mb-3">
        <h2 className="font-display text-2xl text-white tracking-tight font-extrabold leading-none">
          The walk-through
        </h2>
        <span className="text-[11px] text-tertiary uppercase tracking-[0.14em] font-bold">
          {photos.length} shot{photos.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory ps-stream"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpenAt?.(i)}
              className="relative shrink-0 w-full snap-center aspect-[4/3] sm:aspect-[16/9] bg-highlight focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              <FallbackImage
                src={p}
                alt={`${address} photo ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>

        {/* Counter pill */}
        {photos.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[12px] font-bold tabular-nums shadow-lg">
            {index + 1} / {photos.length}
          </div>
        )}
      </div>

      <style jsx>{`
        .ps-stream::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
