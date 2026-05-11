"use client";

import { useEffect, useState } from "react";

interface SpillPortalProps {
  /** Becomes true the moment the Spill button is pressed. */
  open: boolean;
}

/** How long the close-out reverse animation runs before we unmount. */
const CLOSE_MS = 600;

/**
 * SpillPortal — the cinematic moment when the user taps the 🫖 in the bottom nav.
 *
 * Sequence (mobile-first, ~1100ms open / ~600ms close):
 *  1.  ~250ms: page content (header/main/footer) tilts back 5° on X axis,
 *      a dark vignette fades in.
 *  2.  ~400ms: the teapot tilts and a stream of amber→magenta liquid pours
 *      down the center of the screen via an SVG path animation.
 *  3.  ~350ms: a soft radial puddle expands across the bottom of the viewport.
 *  4.  The SpillSheet rises through the puddle (handled in SpillSheet.tsx).
 *
 * Reduced-motion: render nothing. The sheet fades in alone.
 *
 * The component renders nothing while `open` is false. It mounts only when
 * the portal is open, so its keyframes always replay fresh.
 */
export default function SpillPortal({ open }: SpillPortalProps) {
  // Keep the portal mounted briefly after `open` flips to false so we can
  // play a reverse close-out (teapot lifts, puddle dries, vignette fades).
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    // Trigger the reverse animation, then unmount.
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => clearTimeout(t);
  }, [open, mounted]);

  // Toggle a class on <html> so the page-tilt CSS can target body's
  // direct children (header / main / footer). Living on documentElement
  // also makes it easy to scope reduced-motion rules from one place.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (open) {
      root.classList.add("spill-page-tilt");
    } else {
      root.classList.remove("spill-page-tilt");
    }
    return () => {
      root.classList.remove("spill-page-tilt");
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`spill-portal-root${closing ? " spill-portal-root--closing" : ""}`}
      aria-hidden="true"
      // Sits between the backdrop (z-60) and sheet (z-61). We want the
      // pour visible through the darkening overlay, but the rising sheet
      // should land on top of the puddle, so the puddle lives just below.
    >
      {/* Dark vignette that darkens the tilted page. */}
      <div className="spill-portal-vignette" />

      {/* Teapot — top-center, tilts forward as the pour begins. */}
      <div className="spill-portal-teapot-wrap">
        <svg
          className="spill-portal-teapot"
          width="72"
          height="60"
          viewBox="0 0 72 60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <linearGradient id="spillPotBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6A2C" />
              <stop offset="100%" stopColor="#FF2E93" />
            </linearGradient>
            <linearGradient id="spillPotLid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFAA00" />
              <stop offset="100%" stopColor="#FF4D00" />
            </linearGradient>
          </defs>
          {/* steam wisps */}
          <path
            className="spill-portal-steam"
            d="M28 8 C 26 5, 30 4, 28 1"
            stroke="rgba(255,247,232,0.75)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            className="spill-portal-steam spill-portal-steam--b"
            d="M36 9 C 38 6, 34 4, 36 1"
            stroke="rgba(255,247,232,0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* body — geometric squashed circle */}
          <path
            d="M14 28 Q14 18 32 18 Q50 18 50 28 Q50 44 32 44 Q14 44 14 28 Z"
            fill="url(#spillPotBody)"
          />
          {/* handle */}
          <path
            d="M50 24 Q60 24 60 32 Q60 40 50 40"
            stroke="#FF2E93"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* lid */}
          <ellipse cx="32" cy="18" rx="14" ry="3" fill="url(#spillPotLid)" />
          {/* lid knob */}
          <circle cx="32" cy="14" r="2.5" fill="#FFAA00" />
          {/* spout — angled toward viewer so the pour reads as down-screen */}
          <path
            d="M14 26 L4 32 L6 38 L14 34 Z"
            fill="url(#spillPotBody)"
          />
        </svg>
      </div>

      {/* Pouring stream — anchored to the spout, animates downward. */}
      <svg
        className="spill-portal-stream"
        viewBox="0 0 40 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spillStream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFAA00" />
            <stop offset="45%" stopColor="#FF4D00" />
            <stop offset="100%" stopColor="#FF2E93" />
          </linearGradient>
        </defs>
        {/* A slightly curved stream — wobble suggests momentum. */}
        <path
          className="spill-portal-stream-path"
          d="M20 0 C 18 120, 22 240, 20 600"
          stroke="url(#spillStream)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Puddle at the bottom — soft radial that expands then sits. */}
      <div className="spill-portal-puddle" />
    </div>
  );
}
