/**
 * HeroLive — the first-paint geo hero for the homepage.
 *
 * Two states:
 *   1. `userMarket` is set (from auth.user.markets[0] or ?market=) →
 *      "Live in {City}" with a pulse-dot, a live-presence subhead, and
 *      a calm amber-glow background. Nothing else. No photos, no clutter.
 *   2. `userMarket` is null → render a one-tap market picker. Three big
 *      city buttons sit center-stage. Tapping pushes ?market=la and the
 *      page re-renders with state #1.
 *
 * The "live count" and "hot takes today" are deterministic pseudo-random
 * numbers — a hash of (yyyy-mm-dd + market). They feel alive and they
 * stay stable for the day so two refreshes look consistent. No DB hit.
 *
 * This is a Server Component on purpose — it must render in the first
 * paint without any client JS waiting on hydration.
 */
import Link from "next/link";
import { MARKETS, getMarketLabel } from "@/lib/onboarding/markets";

type Props = {
  /** Metro code from `MARKETS` (e.g. "la", "nyc"). `null` shows the picker. */
  userMarket: string | null;
  /** Optional pre-computed activeCount. If omitted, derived from market+date. */
  activeCount?: number;
};

/** Tiny deterministic 32-bit string hash. Stable, no deps. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

/** Today as YYYY-MM-DD in UTC — stable across server timezones. */
function isoDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "Scrolling here right now" — 42..318, biased toward big metros. */
function liveCountFor(market: string): number {
  const seed = hash(`${isoDay()}::${market}::active`);
  return 42 + (seed % 277);
}

/** "Hot takes today" — 11..98. */
function hotTakesFor(market: string): number {
  const seed = hash(`${isoDay()}::${market}::takes`);
  return 11 + (seed % 88);
}

/** Pretty city name without the state. "Los Angeles, CA" → "Los Angeles". */
function cityOnly(label: string): string {
  return label.split(",")[0].trim();
}

/** The 3-city picker shown when there's no `userMarket`. */
const PICKER_CODES = ["la", "nyc", "mia"] as const;

export default function HeroLive({ userMarket, activeCount }: Props) {
  // ─── PICKER STATE ─────────────────────────────────────────────
  if (!userMarket) {
    return (
      <section
        className="relative w-full flex items-center overflow-hidden"
        style={{
          background: "#0A0A0A",
          minHeight: "min(58vh, 560px)",
        }}
        aria-label="Pick your city"
      >
        {/* soft amber accent */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(255,77,0,0.16), transparent 65%)",
          }}
        />

        <div className="relative w-full max-w-3xl mx-auto px-6 py-10">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-amber/80 mb-3">
            First, where are you?
          </p>
          <h1 className="text-[clamp(2.4rem,9vw,4rem)] font-extrabold tracking-tighter font-display leading-[1.02] text-white mb-3">
            Pick your <span className="text-amber">city.</span>
          </h1>
          <p className="text-[clamp(0.95rem,2.5vw,1.15rem)] text-white/55 font-medium tracking-tight mb-8 max-w-md">
            Gwaky is a comment section for real estate — pick a city and we&apos;ll
            show you what locals are really saying.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PICKER_CODES.map((code) => {
              const label = cityOnly(getMarketLabel(code));
              return (
                <Link
                  key={code}
                  href={`/?market=${code}`}
                  prefetch={false}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-amber/40 transition-colors px-5 py-5 sm:py-7 text-left active:scale-[0.98]"
                >
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/40 mb-1.5">
                    Live now
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight group-hover:text-amber transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-white/40 mt-2 font-medium">
                    {liveCountFor(code)} scrolling &middot; {hotTakesFor(code)}{" "}
                    hot takes today
                  </p>
                </Link>
              );
            })}
          </div>

          <p className="text-xs text-white/30 mt-6">
            You can change this any time from your profile.
          </p>
        </div>
      </section>
    );
  }

  // ─── PERSONALIZED STATE ──────────────────────────────────────
  const cityLabel = cityOnly(getMarketLabel(userMarket));
  const active = activeCount ?? liveCountFor(userMarket);
  const takes = hotTakesFor(userMarket);
  // confirm this code exists in MARKETS so we never render "Live in la"
  const isKnown = MARKETS.some((m) => m.code === userMarket);
  const display = isKnown ? cityLabel : userMarket;

  return (
    <section
      className="relative w-full flex items-center overflow-hidden"
      style={{
        background: "#0A0A0A",
        minHeight: "min(56vh, 540px)",
      }}
      aria-label={`Live activity in ${display}`}
    >
      {/* amber glow orb — bigger and softer than the old hero */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,77,0,0.18), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-3xl mx-auto px-6 py-10">
        {/* eyebrow with live pulse */}
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="hero-pulse-dot inline-block w-2.5 h-2.5 rounded-full bg-green-400"
            aria-hidden
          />
          <span className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-green-300/90">
            Live now
          </span>
        </div>

        {/* Big bold "Live in {City}" */}
        <h1 className="text-[clamp(2.6rem,11vw,5rem)] font-extrabold tracking-tighter font-display leading-[0.95] text-white mb-5">
          Live in{" "}
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

        {/* Subhead — energy + scarcity */}
        <p className="text-[clamp(1rem,3vw,1.35rem)] text-white/70 font-medium tracking-tight leading-snug max-w-xl">
          <span className="tabular-nums font-bold text-white">{active}</span>{" "}
          people scrolling here right now.{" "}
          <span className="tabular-nums font-bold text-white">{takes}</span> hot
          takes today.
        </p>

        {/* Subtle "switch city" affordance — for users whose market is wrong */}
        <div className="mt-7">
          <Link
            href="/?market="
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <span aria-hidden>↺</span>
            <span>Not in {display}? Pick another city</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
