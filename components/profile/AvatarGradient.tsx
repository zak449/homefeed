"use client";
/**
 * Deterministic gradient fallback for avatars. Same input string always
 * produces the same gradient + initials, so users without a photo still
 * have a recognizable identity.
 */
import { useMemo } from "react";

const PALETTES: [string, string][] = [
  ["#f59e0b", "#dc2626"],
  ["#0ea5e9", "#6366f1"],
  ["#10b981", "#059669"],
  ["#8b5cf6", "#ec4899"],
  ["#f97316", "#fb923c"],
  ["#06b6d4", "#3b82f6"],
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function AvatarGradient({
  seed,
  label,
  size = 48,
  className = "",
}: {
  seed: string;
  label?: string;
  size?: number;
  className?: string;
}) {
  const { from, to, initials } = useMemo(() => {
    const palette = PALETTES[hash(seed) % PALETTES.length];
    const initials =
      (label ?? seed)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("") || "?";
    return { from: palette[0], to: palette[1], initials };
  }, [seed, label]);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: Math.max(12, Math.round(size * 0.4)),
      }}
      aria-label={label ?? seed}
    >
      {initials}
    </div>
  );
}
