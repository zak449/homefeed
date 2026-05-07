"use client";
/**
 * Streak badge — flame icon + day count. Consumed by the profile page
 * and the public /u/[username] page.
 */
export function StreakBadge({ days, className = "" }: { days: number; className?: string }) {
  if (days < 1) return null;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full bg-amber/10 border border-amber/30 px-2.5 py-1 text-xs font-bold text-amber " +
        className
      }
      title={`${days}-day streak`}
    >
      <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" aria-hidden>
        <path d="M12 2c1 5-4 6-4 11a4 4 0 0 0 8 0c0-2-1-3-2-5 0 0 4 1 5 5a7 7 0 1 1-13 1c0-5 6-7 6-12z" />
      </svg>
      {days}-day streak
    </span>
  );
}
