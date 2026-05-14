"use client";

/**
 * HeroLive — geolocation-first hero for the homepage.
 *
 * Behavior:
 *   1. If `userMarket` is set (from auth.user.markets[0] or ?market=), render
 *      the "Live in {City}" personalized state immediately. Server already
 *      knows where the user belongs — no extra geo prompt needed.
 *   2. Otherwise: render the search box + "Use my location" CTA on first
 *      paint, then fire navigator.geolocation in the background. When that
 *      resolves we surface "We've got you in {Neighborhood, City}" with a
 *      one-tap "Enter Gwaky" CTA and a "switch location" link.
 *
 * No more LA/NYC/Miami picker — the user said "thousands of towns and cities"
 * and that the city picker doesn't feel local. Instead: ask the browser,
 * find their block, or let them search any address / zip / neighborhood.
 *
 * Reverse-geocoding piggybacks on the existing /api/geo endpoint (Nominatim
 * + BigDataCloud) — keeps the User-Agent / attribution centralized.
 * Search suggestions piggyback on /api/autocomplete (Realty in US).
 *
 * Export signature is unchanged so app/page.tsx is untouched.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MARKETS, getMarketLabel } from "@/lib/onboarding/markets";
import { getAnonId, storeLocation } from "@/lib/analytics-client";

type Props = {
  /** Metro code from `MARKETS` (e.g. "la", "nyc"). `null` shows the search-first hero. */
  userMarket: string | null;
  /** Optional pre-computed activeCount. If omitted, derived from market+date. */
  activeCount?: number;
};

/* ───────────────────────── deterministic counters ───────────────────────── */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

function isoDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function liveCountFor(market: string): number {
  return 42 + (hash(`${isoDay()}::${market}::active`) % 277);
}

function hotTakesFor(market: string): number {
  return 11 + (hash(`${isoDay()}::${market}::takes`) % 88);
}

function cityOnly(label: string): string {
  return label.split(",")[0].trim();
}

/* ───────────────────────── market resolution ────────────────────────────── */

/**
 * Map a city/state pair from reverse-geocode to a market `code` if we have
 * one. Falls back to a substring/alias scan. Returns `null` when the user is
 * outside our known metros — we still show the resolved label as text, we
 * just don't auto-route them.
 */
function matchMarketFromCity(city: string, state: string): string | null {
  const c = city.trim().toLowerCase();
  if (!c) return null;
  for (const m of MARKETS) {
    const label = m.label.toLowerCase();
    if (label.startsWith(c) || m.aliases.includes(c)) return m.code;
    if (label.includes(c)) return m.code;
  }
  // Fall back: try "city, ST" combined match against label
  const combined = state ? `${c}, ${state.toLowerCase()}` : c;
  for (const m of MARKETS) {
    if (m.label.toLowerCase().includes(combined)) return m.code;
  }
  return null;
}

/* ───────────────────────── types ────────────────────────────────────────── */

type GeoResolved = {
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  marketCode: string | null;
  latitude: number;
  longitude: number;
};

type Suggestion = {
  label: string;
  city: string;
  state: string;
  type: string; // "city" | "neighborhood" | "postal_code" | "address"
};

type GeoState =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "resolved"; data: GeoResolved }
  | { kind: "denied" }
  | { kind: "unavailable" };

/* ───────────────────────── component ────────────────────────────────────── */

export default function HeroLive({ userMarket, activeCount }: Props) {
  // ─── PERSONALIZED STATE — already know the market ─────────
  if (userMarket) {
    return <PersonalizedHero userMarket={userMarket} activeCount={activeCount} />;
  }

  // ─── SEARCH-FIRST STATE — no market yet ───────────────────
  return <SearchFirstHero />;
}

/* ─────────────────── personalized (existing) state ──────────────────────── */

function PersonalizedHero({
  userMarket,
  activeCount,
}: {
  userMarket: string;
  activeCount?: number;
}) {
  const cityLabel = cityOnly(getMarketLabel(userMarket));
  const isKnown = MARKETS.some((m) => m.code === userMarket);
  const display = isKnown ? cityLabel : userMarket;
  const active = activeCount ?? liveCountFor(userMarket);
  const takes = hotTakesFor(userMarket);

  return (
    <section
      className="relative w-full flex items-center overflow-hidden"
      style={{
        background: "#0A0A0A",
        minHeight: "min(40vh, 380px)",
      }}
      aria-label={`Live activity in ${display}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,77,0,0.18), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-3xl mx-auto px-6 py-8 sm:py-10">
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className="hero-pulse-dot inline-block w-2.5 h-2.5 rounded-full bg-green-400"
            aria-hidden
          />
          <span className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-green-300/90">
            Live in
          </span>
        </div>

        <h1 className="text-[clamp(2.2rem,9vw,4.2rem)] font-extrabold tracking-tighter font-display leading-[0.95] text-white mb-3">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(95deg, #FFC178 0%, #FF7A1F 45%, #FF4D00 100%)",
            }}
          >
            {display}
          </span>
          <span className="text-amber">.</span>
        </h1>

        <p className="text-[clamp(0.95rem,2.8vw,1.2rem)] text-white/70 font-medium tracking-tight leading-snug max-w-xl">
          <span className="tabular-nums font-bold text-white">{active}</span>{" "}
          neighbors scrolling right now ·{" "}
          <span className="tabular-nums font-bold text-white">{takes}</span> hot
          takes today.
        </p>

        <div className="mt-5">
          <Link
            href="/?market="
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <span aria-hidden>↺</span>
            <span>Not in {display}? Switch location</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── search-first hero (the new UX) ───────────────────── */

function SearchFirstHero() {
  const router = useRouter();
  const [geo, setGeo] = useState<GeoState>({ kind: "idle" });
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = "hero-suggestions";

  /* ─── geolocation request ─── */
  const requestGeo = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeo({ kind: "unavailable" });
      return;
    }
    setGeo({ kind: "requesting" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reuse the existing /api/geo reverse-geocode endpoint (Nominatim
          // + BigDataCloud) — it already has the proper User-Agent header
          // and DB persistence wired up.
          const anonId = getAnonId();
          const res = await fetch("/api/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonId, latitude, longitude }),
          });
          if (!res.ok) throw new Error(`geo ${res.status}`);
          const data = await res.json();
          const city = (data.city ?? "").trim();
          const state = (data.state ?? "").trim();
          const zip = (data.zip ?? "").trim();
          // Neighborhood: /api/geo doesn't return one today; fall back to
          // a fresh Nominatim hit at zoom=17 (suburb/neighbourhood level)
          // so we can show "Live in Echo Park, Los Angeles" when available.
          let neighborhood = "";
          try {
            const nbRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=17&addressdetails=1`,
              {
                headers: { Accept: "application/json" },
              },
            );
            if (nbRes.ok) {
              const j = await nbRes.json();
              neighborhood =
                j?.address?.neighbourhood ||
                j?.address?.suburb ||
                j?.address?.quarter ||
                "";
            }
          } catch {
            /* neighborhood is best-effort */
          }
          if (city) storeLocation({ latitude, longitude, city, state, zip });
          const marketCode = matchMarketFromCity(city, state);
          setGeo({
            kind: "resolved",
            data: {
              city,
              state,
              zip,
              neighborhood,
              marketCode,
              latitude,
              longitude,
            },
          });
        } catch {
          setGeo({ kind: "unavailable" });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeo({ kind: "denied" });
        else setGeo({ kind: "unavailable" });
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );
  }, []);

  /* Fire geo on mount — async, never blocks the search UI. */
  useEffect(() => {
    requestGeo();
  }, [requestGeo]);

  /* ─── debounced autocomplete ─── */
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(q)}`,
          { signal: AbortSignal.timeout(5000) },
        );
        if (!res.ok) return;
        const json = await res.json();
        const raw: Suggestion[] = Array.isArray(json.suggestions)
          ? json.suggestions
          : [];
        setSuggestions(raw);
        setActiveIdx(raw.length > 0 ? 0 : -1);
      } catch {
        /* fail silently — search is best-effort */
      }
    }, 220);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* ─── navigation from a suggestion ─── */
  const navigateForSuggestion = useCallback(
    (s: Suggestion) => {
      if (s.type === "postal_code") {
        const zip = s.label.match(/\b\d{5}\b/)?.[0];
        if (zip) {
          router.push(`/community/${zip}`);
          return;
        }
      }
      const marketCode = matchMarketFromCity(s.city, s.state);
      if (marketCode) {
        router.push(`/?market=${marketCode}`);
        return;
      }
      // Fallback — push the city name into the existing ?city= filter so
      // the listing feed at least narrows down.
      const cityParam = s.city || s.label.split(",")[0];
      router.push(`/?city=${encodeURIComponent(cityParam)}`);
    },
    [router],
  );

  /* ─── keyboard handling on the search box ─── */
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (showSuggestions && activeIdx >= 0 && suggestions[activeIdx]) {
        e.preventDefault();
        navigateForSuggestion(suggestions[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  /* ─── derived UI strings ─── */
  const resolvedLabel = useMemo(() => {
    if (geo.kind !== "resolved") return null;
    const { neighborhood, city, state } = geo.data;
    const parts = [neighborhood, city].filter(Boolean);
    const head = parts.join(", ") || city || "your block";
    return state && !head.includes(state) ? `${head}, ${state}` : head;
  }, [geo]);

  const resolvedHref = useMemo(() => {
    if (geo.kind !== "resolved") return null;
    if (geo.data.marketCode) return `/?market=${geo.data.marketCode}`;
    if (geo.data.zip) return `/community/${geo.data.zip}`;
    if (geo.data.city) return `/?city=${encodeURIComponent(geo.data.city)}`;
    return null;
  }, [geo]);

  return (
    <section
      className="relative w-full flex items-center overflow-hidden"
      style={{
        background: "#0A0A0A",
        minHeight: "min(40vh, 380px)",
      }}
      aria-label="Find your neighborhood"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(255,77,0,0.16), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-3xl mx-auto px-5 sm:px-6 py-7 sm:py-9">
        {/* Eyebrow — adapts to geo state */}
        <div className="flex items-center gap-2.5 mb-3 min-h-[20px]">
          {geo.kind === "resolved" ? (
            <>
              <span
                className="hero-pulse-dot inline-block w-2.5 h-2.5 rounded-full bg-green-400"
                aria-hidden
              />
              <span className="text-[11px] sm:text-sm font-semibold tracking-[0.18em] uppercase text-green-300/90">
                We&apos;ve got you
              </span>
            </>
          ) : geo.kind === "requesting" ? (
            <span className="text-[11px] sm:text-sm font-semibold tracking-[0.18em] uppercase text-white/40">
              Finding your block…
            </span>
          ) : (
            <span className="text-[11px] sm:text-sm font-semibold tracking-[0.18em] uppercase text-amber/80">
              Real takes, near you
            </span>
          )}
        </div>

        {/* Headline */}
        {geo.kind === "resolved" && resolvedLabel ? (
          <h1 className="text-[clamp(1.9rem,8vw,3.4rem)] font-extrabold tracking-tighter font-display leading-[1.0] text-white mb-4">
            Live in{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(95deg, #FFC178 0%, #FF7A1F 45%, #FF4D00 100%)",
              }}
            >
              {resolvedLabel}
            </span>
            <span className="text-amber">.</span>
          </h1>
        ) : (
          <h1 className="text-[clamp(1.9rem,8vw,3.4rem)] font-extrabold tracking-tighter font-display leading-[1.0] text-white mb-4">
            What&apos;s your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(95deg, #FFC178 0%, #FF7A1F 45%, #FF4D00 100%)",
              }}
            >
              neighborhood
            </span>
            <span className="text-amber">?</span>
          </h1>
        )}

        {/* Resolved CTA row — appears once geo lands */}
        {geo.kind === "resolved" && resolvedHref ? (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href={resolvedHref}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-3 text-sm sm:text-base font-bold text-black active:scale-[0.98] transition-transform"
              style={{ backgroundColor: "#FF7A1F" }}
            >
              See what neighbors are saying
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setGeo({ kind: "idle" });
                inputRef.current?.focus();
              }}
              className="text-xs sm:text-sm text-white/50 hover:text-white/80 underline-offset-4 hover:underline"
            >
              Switch location
            </button>
          </div>
        ) : null}

        {/* Search box + geo button — always rendered so users can start typing immediately */}
        <div className="relative">
          <label htmlFor="hero-search" className="sr-only">
            Search any address, zip, or neighborhood
          </label>
          <div
            className="flex items-stretch gap-2 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-amber/50 transition-colors"
            role="combobox"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-haspopup="listbox"
            aria-owns={listboxId}
          >
            <div className="flex-1 flex items-center pl-4">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white/40 mr-2 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                id="hero-search"
                type="search"
                inputMode="search"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay so a tap on a suggestion still registers.
                  window.setTimeout(() => setShowSuggestions(false), 150);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search any address, zip, or neighborhood"
                className="w-full bg-transparent text-white placeholder-white/35 py-3.5 sm:py-3 pr-3 outline-none text-base"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={
                  activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined
                }
              />
            </div>
            <button
              type="button"
              onClick={requestGeo}
              disabled={geo.kind === "requesting"}
              aria-label="Use my current location"
              className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 my-1.5 mr-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-50 transition-colors text-xs sm:text-sm font-semibold text-white/90"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8Z" />
              </svg>
              <span className="hidden sm:inline">
                {geo.kind === "requesting" ? "Finding…" : "Use my location"}
              </span>
              <span className="sm:hidden">
                {geo.kind === "requesting" ? "…" : "Locate"}
              </span>
            </button>
          </div>

          {/* Suggestion list */}
          {showSuggestions && suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigateForSuggestion(s)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`w-full text-left px-4 py-3 sm:py-2.5 flex items-center gap-3 text-sm transition-colors ${
                      i === activeIdx
                        ? "bg-white/[0.06] text-white"
                        : "text-white/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="text-[10px] font-bold tracking-wider uppercase text-white/40 w-16 shrink-0"
                    >
                      {s.type === "postal_code"
                        ? "Zip"
                        : s.type === "address"
                          ? "Address"
                          : s.type === "neighborhood"
                            ? "Hood"
                            : "City"}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Helper line — sub-search, matches the user's "neighborhood / other communities" framing */}
        <p className="mt-3 text-[12px] sm:text-xs text-white/40">
          {geo.kind === "denied"
            ? "Location blocked — no worries. Search any community above."
            : geo.kind === "unavailable"
              ? "Couldn't pin your block — type any zip or neighborhood to jump in."
              : "We'll find your block. Or search other communities."}
        </p>
      </div>
    </section>
  );
}
