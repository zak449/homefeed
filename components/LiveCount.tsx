"use client";

/**
 * LiveCount — animated numeric ticker.
 *
 * Drop in for any count that changes during a session (comments, reactions,
 * watchers, streak days). On every increment the new digit slides up + flashes
 * tea magenta briefly. Pure presentation — pass it the new `value` and it
 * does the rest.
 *
 * Numbers should never JUMP in a viral consumer app. They should TICK.
 */

import { useEffect, useRef, useState } from "react";

interface LiveCountProps {
  value: number;
  /** Add a + prefix on increment-only counts. */
  showSign?: boolean;
  /** Optional formatter — e.g. compactNumber. */
  format?: (n: number) => string;
  className?: string;
  /** aria-label override; defaults to value. */
  label?: string;
}

const defaultFormat = (n: number) => n.toLocaleString();

export default function LiveCount({
  value,
  showSign = false,
  format = defaultFormat,
  className,
  label,
}: LiveCountProps) {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState<"up" | "down" | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    setBump(value > prev.current ? "up" : "down");
    setDisplay(value);
    prev.current = value;
    const t = setTimeout(() => setBump(null), 360);
    return () => clearTimeout(t);
  }, [value]);

  const sign = showSign && value > 0 ? "+" : "";
  const cls =
    "inline-block tabular-nums transition-colors " +
    (bump === "up" ? "count-up text-tea-300" :
     bump === "down" ? "count-up text-secondary" :
     "");

  return (
    <span
      key={display}
      className={`${cls} ${className ?? ""}`}
      aria-label={label ?? `${value}`}
      aria-live="polite"
    >
      {sign}{format(display)}
    </span>
  );
}

/** Compact number formatter — 1.2k, 24k, 1.4m */
export function compactNumber(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}
