"use client";

/**
 * FeedFilterChips — sticky in-place filter row for the homepage feed.
 *
 * Tapping a chip:
 *   1. Updates the URL's `?sort=` param via `router.replace` (no history pollution).
 *   2. Emits a `feed:filter` CustomEvent on `window` so SmartListingFeed (or any
 *      future listener) can re-rank locally without a full server reroute.
 *
 * Active chip gets an amber underline (animated in from the left) and a
 * heavier weight. Others ghost back to white/50.
 *
 * Vocab follows the rest of the site: hot / new / red flags / price check.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Chip = {
  /** Slug used in the URL. `null` = "all" (no `sort` param). */
  sort: string | null;
  emoji?: string;
  label: string;
};

const CHIPS: Chip[] = [
  { sort: null, label: "All" },
  { sort: "hot", emoji: "🔥", label: "Hot" },
  { sort: "new", emoji: "🆕", label: "New" },
  { sort: "red-flags", emoji: "🚩", label: "Red flags" },
  { sort: "price-check", emoji: "💀", label: "Price check" },
];

export default function FeedFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read the current sort from the URL. Treat unknown values as "all" so
  // legacy `?sort=comments` links don't render with nothing selected.
  const urlSort = searchParams.get("sort");
  const validSorts = useMemo(
    () => new Set(CHIPS.map((c) => c.sort).filter((s): s is string => s != null)),
    [],
  );
  const active = urlSort && validSorts.has(urlSort) ? urlSort : null;

  // Track active locally too so taps feel instant (no waiting for re-render
  // from the router).
  const [optimistic, setOptimistic] = useState<string | null>(active);
  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  const onPick = useCallback(
    (sort: string | null) => {
      setOptimistic(sort);

      // Build new URL — preserve every other param the user already has.
      const params = new URLSearchParams(searchParams.toString());
      if (sort === null) params.delete("sort");
      else params.set("sort", sort);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

      // Tell the feed locally — for instant re-rank with no server reroute.
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("feed:filter", { detail: { sort: sort ?? "all" } }),
        );
      }
    },
    [pathname, router, searchParams],
  );

  return (
    <div
      className="sticky top-0 z-30 -mx-px backdrop-blur-md"
      style={{ background: "rgba(10,10,15,0.82)" }}
      role="tablist"
      aria-label="Filter feed"
    >
      <div className="max-w-3xl mx-auto px-5 py-3 border-b border-white/[0.06]">
        <div className="relative">
          <div className="flex gap-5 overflow-x-auto scrollbar-none pr-8">
            {CHIPS.map((c) => {
              const isActive = optimistic === c.sort;
              return (
                <button
                  key={c.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onPick(c.sort)}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 py-1.5 text-sm transition-colors duration-150 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-white/55 font-medium hover:text-white/85"
                  }`}
                  style={{
                    // active chips get 600 weight per the spec
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {c.emoji && (
                    <span className="text-base leading-none" aria-hidden>
                      {c.emoji}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{c.label}</span>
                  {isActive && (
                    <span
                      className="feed-chips-active absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-amber"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* edge fade for scroll-affordance */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8"
            style={{
              background:
                "linear-gradient(to left, rgba(10,10,15,0.92), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
