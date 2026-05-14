"use client";

/**
 * CountdownCard — small client child that ticks down to midnight local time.
 *
 * Lives inside the /today page hero. Server renders an initial "hh mm" value
 * from a passed-in `initialHours` / `initialMinutes` snapshot so the first
 * paint isn't blank; then this component hydrates and keeps the clock alive.
 *
 * Reduced-motion friendly — no pulsing/spinning when the user has opted out.
 */

import { useEffect, useState } from "react";

interface CountdownCardProps {
  initialHours: number;
  initialMinutes: number;
}

function untilMidnight(): { h: number; m: number } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
  };
}

export default function CountdownCard({
  initialHours,
  initialMinutes,
}: CountdownCardProps) {
  const [{ h, m }, setT] = useState({ h: initialHours, m: initialMinutes });
  useEffect(() => {
    setT(untilMidnight());
    const id = setInterval(() => setT(untilMidnight()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums text-amber" suppressHydrationWarning>
      {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m
    </span>
  );
}
