"use client";

/**
 * BottomActionBar — pinned mobile action strip on the listing page.
 * Sits above the global mobile tab nav. Heart-save + price tier + the
 * primary "Spill your truth" CTA. Persists across scroll.
 *
 * SaveButton is loaded as a slot so we don't duplicate its localStorage
 * logic. The price tier is a small contextual chip (e.g. "$680k · 3bd").
 */

import { useEffect, useState, type ReactNode } from "react";

interface Props {
  priceLabel: string;
  specLabel: string;
  isLocked: boolean;
  saveButton: ReactNode;
}

export default function BottomActionBar({
  priceLabel,
  specLabel,
  isLocked,
  saveButton,
}: Props) {
  const [visible, setVisible] = useState(false);

  // Reveal after the hero has scrolled past — keeps the immersive opening clean
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-label="Quick actions"
      className={`fixed inset-x-0 z-40 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
      style={{
        // Sit above the global mobile tab nav (≈64px) + safe-area inset.
        bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-3 mb-2 rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-md shadow-elevated px-3 py-2.5 flex items-center gap-2.5">
        {/* Save heart */}
        <div className="shrink-0 [&_button]:!bg-highlight [&_button]:!text-white [&_button]:!border-0 [&_button]:!rounded-xl [&_button]:!w-11 [&_button]:!h-11 [&_button]:!min-w-[44px] [&_button]:!p-0 [&_button]:!flex [&_button]:!items-center [&_button]:!justify-center">
          {saveButton}
        </div>

        {/* Price tier */}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-white text-[14px] font-bold truncate">{priceLabel}</p>
          {specLabel && (
            <p className="text-secondary text-[11px] truncate">{specLabel}</p>
          )}
        </div>

        {/* Primary CTA */}
        {isLocked ? (
          <span className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 h-11 rounded-xl bg-highlight text-secondary text-[13px] font-bold">
            Comments locked
          </span>
        ) : (
          <a
            href="#spill-form"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 h-11 rounded-xl bg-amber text-white text-[13px] font-bold hover:bg-amber/90 transition-colors"
          >
            <span aria-hidden="true">🫖</span>
            Spill your truth
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
