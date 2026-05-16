/**
 * TodayHero — server component. The energy-only opener of /today.
 *
 * Pure presentational shell. Receives a pre-formatted dateLabel, totals, and
 * a server-rendered initial countdown that gets hydrated by CountdownCard.
 */

import CountdownCard from "./CountdownCard";

interface TodayHeroProps {
  dateLabel: string;
  totalTakes: number;
  totalListings: number;
  redFlagCount: number;
  hoursToMidnight: number;
  minutesToMidnight: number;
}

export default function TodayHero({
  dateLabel,
  totalTakes,
  totalListings,
  redFlagCount,
  hoursToMidnight,
  minutesToMidnight,
}: TodayHeroProps) {
  return (
    <section className="px-5 pt-6 pb-5 sm:pt-10 sm:pb-7 border-b border-divider/60">
      <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-amber mb-3">
        {dateLabel}
      </p>

      <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] leading-[0.95] tracking-tight text-ink mb-3">
        Today on the block
      </h1>

      <p className="text-base sm:text-lg text-secondary leading-snug max-w-xl mb-5">
        The takes the whole neighborhood is reading.{" "}
        <span className="text-ink/80">Resets at midnight.</span>
      </p>

      {/* Live counter row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/12 border border-amber/30 text-amber font-bold tabular-nums">
          <span aria-hidden="true">🫖</span>
          {totalTakes} takes today
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-divider text-ink font-semibold tabular-nums">
          <span aria-hidden="true">🔥</span>
          {totalListings} listings on fire
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-flag/10 border border-red-flag/30 text-red-flag font-bold tabular-nums">
          <span aria-hidden="true">🚩</span>
          {redFlagCount} red flags
        </span>
      </div>

      {/* Countdown card */}
      <div className="mt-5 rounded-2xl bg-surface/70 border border-divider/60 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-tertiary">
            Resets in
          </p>
          <p className="text-base font-bold">
            <CountdownCard
              initialHours={hoursToMidnight}
              initialMinutes={minutesToMidnight}
            />
          </p>
        </div>
        <p className="text-xs text-secondary text-right max-w-[10rem] leading-tight">
          Tomorrow&apos;s tea brews now <span aria-hidden="true">✨</span>
        </p>
      </div>
    </section>
  );
}
