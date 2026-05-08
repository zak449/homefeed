"use client";

/**
 * WatchingNow — "12 people reading this listing right now" indicator.
 *
 * Server-side presence is wired separately. This component takes a starting
 * `count` and ticks it gently up/down every ~6–14s with realistic variance
 * to feel alive even in low-traffic scenarios. When `realtimeCount` is
 * provided (from a server-sent event), it overrides the simulation.
 *
 * Social proof that costs us nothing. Prints engagement.
 */

import { useEffect, useState } from "react";
import LiveCount from "./LiveCount";

interface WatchingNowProps {
  /** Initial / fallback count. */
  count: number;
  /** Live count from SSE / WebSocket — when present, simulation pauses. */
  realtimeCount?: number;
  className?: string;
  /** Compact mode (no label, just the dot + number) */
  compact?: boolean;
}

export default function WatchingNow({ count, realtimeCount, className, compact }: WatchingNowProps) {
  const [n, setN] = useState(count);

  useEffect(() => {
    if (typeof realtimeCount === "number") {
      setN(realtimeCount);
      return;
    }
    // Gentle simulation: random walk every 6–14s, bounded near the seed.
    const tick = () => {
      setN(prev => {
        const drift = Math.random() < 0.55 ? 1 : -1;
        const next  = Math.max(1, Math.min(count + 12, prev + drift));
        return next;
      });
    };
    const id = setInterval(tick, 6000 + Math.random() * 8000);
    return () => clearInterval(id);
  }, [count, realtimeCount]);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-tag uppercase tracking-wider text-lime-300 ${className ?? ""}`} aria-live="polite">
        <span className="live-dot" />
        <LiveCount value={n} className="font-bold text-lime-300" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 text-caption text-secondary ${className ?? ""}`}
      aria-live="polite"
    >
      <span className="live-dot" aria-hidden />
      <span>
        <LiveCount value={n} className="text-ink font-semibold" /> reading right now
      </span>
    </span>
  );
}
