"use client";

import { useCallback, useEffect, useState } from "react";
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

  if (photos.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid */}
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
          <button
            onClick={() => openAt(0)}
            className="col-span-4 sm:col-span-2 sm:row-span-2 relative aspect-[4/3] sm:aspect-auto min-h-[200px] bg-tag cursor-pointer"
          >
            <FallbackImage
              src={photos[0]}
              alt={address}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </button>
          {photos.slice(1, 5).map((p, i) => (
            <button
              key={i}
              onClick={() => openAt(i + 1)}
              className="relative aspect-[4/3] bg-tag hidden sm:block cursor-pointer"
            >
              <FallbackImage
                src={p}
                alt={`${address} photo ${i + 2}`}
                className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
              {i === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    +{photos.length - 5}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center"
            aria-label="Close lightbox"
          >
            &times;
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium z-10">
            {index + 1} / {photos.length}
          </div>

          {/* Previous */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 w-12 h-12 flex items-center justify-center"
              aria-label="Previous photo"
            >
              &#8249;
            </button>
          )}

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 w-12 h-12 flex items-center justify-center"
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
