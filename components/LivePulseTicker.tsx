"use client";

/**
 * LivePulseTicker — horizontal pill strip near the top of the home feed
 * that surfaces fresh activity ("Marcus just dropped a price check on 55
 * Hastings", "3 new takes near you in the last hour", etc.).
 *
 * Behavior:
 *   - SSR-friendly: renders the first pulse statically so the first paint
 *     is never a blank strip.
 *   - Rotates one pulse at a time on the client, fading-and-sliding every
 *     ~5 seconds.
 *   - Respects `prefers-reduced-motion`: in that mode we render the
 *     pulses as a horizontally scrollable strip with no auto-rotation.
 *   - Tappable: each pulse is wrapped in an <a> when `href` is set.
 *   - No new deps. Tailwind + inline keyframes only.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { LivePulse } from "@/lib/livePulse";

type Props = {
  pulses: LivePulse[];
  /** ms between rotations. Defaults to 5000. */
  intervalMs?: number;
};

const FADE_MS = 380;

export default function LivePulseTicker({ pulses, intervalMs = 5000 }: Props) {
  // Hooks must be declared unconditionally — early-return for empty pulses
  // happens *after* the hooks below.
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable, deduped list. If the parent ever hands us empty, we still
  // bail out below.
  const items = useMemo(() => {
    const seen = new Set<string>();
    return pulses.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [pulses]);

  // Detect reduced-motion preference on the client.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Rotation engine: fade out, swap, fade in. Pauses when document is
  // hidden so we don't burn cycles in a backgrounded tab.
  useEffect(() => {
    if (reducedMotion) return;
    if (items.length <= 1) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) {
        timer.current = setTimeout(tick, intervalMs);
        return;
      }
      setPhase("out");
      timer.current = setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % items.length);
        setPhase("in");
        timer.current = setTimeout(tick, intervalMs);
      }, FADE_MS);
    };

    timer.current = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items.length, intervalMs, reducedMotion]);

  if (items.length === 0) return null;

  // Reduced-motion / no-js path: a horizontally scrollable strip of pills.
  if (reducedMotion || items.length === 1) {
    return (
      <div className="w-full">
        <div
          className="flex items-center gap-2 overflow-x-auto px-5 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Live activity"
        >
          {items.map((p) => (
            <PulsePill key={p.id} pulse={p} />
          ))}
        </div>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="w-full">
      <div
        className="relative flex items-center justify-center px-5 py-2"
        style={{ minHeight: 40 }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          key={current.id}
          className={
            "transition-all ease-out " +
            (phase === "in"
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1")
          }
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <PulsePill pulse={current} />
        </div>
      </div>
    </div>
  );
}

/* ── one pill ────────────────────────────────────────────────── */

function PulsePill({ pulse }: { pulse: LivePulse }) {
  const inner = (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-divider bg-surface/80 px-3 py-1.5 text-xs font-medium text-ink shadow-card backdrop-blur hover:border-amber/40 hover:text-white transition-colors">
      <span
        className="relative inline-flex h-2 w-2 shrink-0"
        aria-hidden="true"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400/70 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      {pulse.icon && (
        <span aria-hidden="true" className="shrink-0">
          {pulse.icon}
        </span>
      )}
      <span className="truncate max-w-[78vw] sm:max-w-[520px]">
        {pulse.text}
      </span>
    </span>
  );

  if (pulse.href) {
    return (
      <a
        href={pulse.href}
        className="inline-flex max-w-full no-underline"
        aria-label={pulse.text}
      >
        {inner}
      </a>
    );
  }
  return inner;
}
