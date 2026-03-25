"use client";

const BADGE_TIERS = [
  { min: 50, label: "\uD83D\uDC51 Community Legend", color: "bg-amber-50 text-amber-700 border-amber-200/60" },
  { min: 25, label: "\uD83D\uDD25 Power User", color: "bg-social-light text-social border-social/20" },
  { min: 10, label: "\uD83C\uDFE0 Local Expert", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  { min: 5,  label: "\uD83D\uDCAC Regular", color: "bg-blue-50 text-blue-700 border-blue-200/60" },
  { min: 1,  label: "\uD83C\uDD95 Newcomer", color: "bg-tag text-muted border-border" },
];

export function getBadge(commentCount: number) {
  for (const tier of BADGE_TIERS) {
    if (commentCount >= tier.min) return tier;
  }
  return null;
}

export default function UserBadge({ commentCount }: { commentCount: number }) {
  const badge = getBadge(commentCount);
  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md border ${badge.color}`}
    >
      {badge.label}
    </span>
  );
}
