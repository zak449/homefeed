"use client";

/**
 * SpillsStack — Instagram-Story-style stacked spills.
 *
 * Renders the first N comments as scroll-in cards (name → quote → time →
 * reactions). Below the stack a "See all spills" anchor reveals the full
 * ThreadedComments component below. Children prop is the threaded comments
 * component, kept hidden until expanded.
 *
 * This is the HERO section of the page. Not a sidebar. Not a tab.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface SpillRow {
  id: string;
  authorName: string;
  authorInitial: string;
  authorBadge?: string | null;
  content: string;
  createdAt: string; // ISO
  reactionCounts: Record<string, number>;
  isRedFlag: boolean;
}

interface Props {
  spills: SpillRow[];
  totalCount: number;
  /** ThreadedComments fully-interactive children. Hidden until expanded. */
  fullThread: ReactNode;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const sec = Math.max(0, Math.round((now - then) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

const REACTION_LABELS: Record<string, string> = {
  "🚩": "Red flag",
  "💸": "Overpriced",
  "👀": "Sus",
  "🔥": "Fire",
  "💀": "Run",
  "❤️": "Love",
  "😂": "Lol",
  "😮": "Whoa",
};

export default function SpillsStack({ spills, totalCount, fullThread }: Props) {
  const [expanded, setExpanded] = useState(false);
  const stackRef = useRef<HTMLDivElement | null>(null);

  // Stagger reveal on intersect
  useEffect(() => {
    const root = stackRef.current;
    if (!root) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-spill-row]"));
    if (reduced) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-in");
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [spills.length]);

  return (
    <section id="all-spills" aria-label="All the spills on this place" className="relative">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight font-extrabold leading-none">
            All the spills
          </h2>
          <p className="text-secondary text-[13px] mt-1.5">
            {totalCount === 0
              ? "Nobody's spilled yet. You first?"
              : `${totalCount} take${totalCount === 1 ? "" : "s"} — straight from the block.`}
          </p>
        </div>
        {totalCount > 0 && (
          <a
            href="#spill-form"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.14em] text-amber hover:text-amber/80 transition-colors"
          >
            Spill yours →
          </a>
        )}
      </div>

      {spills.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-6 text-center">
          <p className="text-white text-[15px] font-bold">No takes here yet.</p>
          <p className="text-secondary text-[13px] mt-1">
            Drop the first one — the block sees what the listing won&apos;t say.
          </p>
          <a
            href="#spill-form"
            className="mt-4 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-amber text-white text-sm font-bold rounded-xl hover:bg-amber/90 transition-colors"
          >
            🫖 Spill your truth →
          </a>
        </div>
      ) : (
        <>
          <div ref={stackRef} className="space-y-3">
            {spills.map((s, i) => (
              <article
                key={s.id}
                data-spill-row
                style={{ ["--spill-i" as string]: i }}
                className="spill-row relative rounded-2xl border border-divider bg-surface p-4 sm:p-5 hover:border-amber/30 transition-colors"
              >
                {s.isRedFlag && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full bg-red-flag/15 text-red-flag border border-red-flag/30">
                    🚩 Red flag
                  </span>
                )}

                <header className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-amber/15 border border-amber/25 flex items-center justify-center text-amber text-[13px] font-bold uppercase">
                    {s.authorInitial}
                  </span>
                  <div className="leading-tight min-w-0">
                    <p className="text-white text-[13px] font-bold truncate">
                      {s.authorName}
                      {s.authorBadge && (
                        <span className="ml-1.5 text-[10px] text-amber/90 uppercase tracking-wide font-semibold">
                          · {s.authorBadge}
                        </span>
                      )}
                    </p>
                    <p className="text-tertiary text-[11px]">{relativeTime(s.createdAt)}</p>
                  </div>
                </header>

                <p className="mt-3 text-white/95 text-[15px] leading-relaxed">
                  {s.content}
                </p>

                {Object.keys(s.reactionCounts).length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {Object.entries(s.reactionCounts)
                      .filter(([, n]) => n > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-highlight/70 border border-divider/60 text-[11px] text-white/90 font-medium"
                          title={REACTION_LABELS[emoji] ?? emoji}
                        >
                          <span aria-hidden="true">{emoji}</span>
                          <span className="tabular-nums">{count}</span>
                        </span>
                      ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          {totalCount > spills.length && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-5 w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl border border-amber/30 bg-amber/10 hover:bg-amber/15 text-amber text-sm font-bold transition-colors"
            >
              <span aria-hidden="true">🫖</span>
              See all {totalCount} spills
              <span aria-hidden="true">↓</span>
            </button>
          )}
        </>
      )}

      {/* Full threaded thread, revealed once user opts in or always-visible
         when stack is empty (so the composer is reachable). */}
      <div
        id="spill-form"
        className={
          expanded || spills.length === 0
            ? "mt-7 pt-6 border-t border-divider"
            : "mt-7 pt-6 border-t border-divider hidden"
        }
      >
        {fullThread}
      </div>

      <style jsx>{`
        .spill-row {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: calc(min(var(--spill-i, 0), 6) * 70ms);
          will-change: opacity, transform;
        }
        .spill-row.is-in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .spill-row {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
