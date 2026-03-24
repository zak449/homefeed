"use client";

import { useGeo } from "@/components/GeoProvider";

/**
 * Sticky bottom CTA that shows "What's happening near [City]?"
 * when location is known, otherwise shows the default text.
 */
export default function GeoStickyBottomCTA() {
  const { location } = useGeo();

  const ctaText = location?.city
    ? `What\u2019s happening near ${location.city}?`
    : "What do you know about your neighborhood?";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="bg-surface/95 backdrop-blur-md border-t border-divider px-4 py-3 safe-area-pb">
        <a
          href="/?city="
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-highlight border border-divider text-left hover:border-amber/30 active:scale-[0.98] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm text-tertiary">{ctaText}</span>
        </a>
      </div>
    </div>
  );
}
