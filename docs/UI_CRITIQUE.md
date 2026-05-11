# Gwaky — UI/UX Critique (May 2026)

Audit pass focused on the homepage, the feed, and the listing card. Production at gwaky.com. Mobile-first (390x844). Stack: Next 15 + React 19 + Tailwind 3.

User's complaint, in one line: **"It's not pulling me deeper, it's overwhelming me. Show me less, but make every piece feel like a discovery."**

---

## What's working — keep these

1. **The hottest-take hero card on the landing page** (`app/page.tsx:492-548`). The "Real estate finally has a comment section" headline + a real top take is genuinely the differentiator. Don't water this down.
2. **Social-first listing cards in the feed** — leading with a real neighbor quote above the photo (`app/page.tsx:708-722`) is the right call. People scroll past photos; they stop for quotes.
3. **Dark, low-chrome palette** (`tailwind.config.ts:12-37`). The `#0A0A0F` base + `#FF4D00` accent reads premium and modern. It's the right canvas — we just under-use it.
4. **Bottom nav with the elevated Spill button** (`components/MobileNav.tsx:116-120`). The floating amber 🫖 disc is the only place the brand voice survives in chrome. Keep and amplify.
5. **Live autocomplete + "Use Current Location"** in SearchBar (`components/SearchBar.tsx:314-332`). The mechanics are solid. It just needs to be the hero of the page in some modes, not a tertiary input.

---

## What's confusing the user

1. **The feed pattern is hardcoded and arbitrary.** `app/page.tsx:391-394` enforces the literal sequence `take, take, neighborhood, listing, take, founder, listing, listing`. That's why the screen reads as "a bunch of random stuff" — there's no grouping by city, no "see more from this block," no learning of what the user actually wants. It feels like a shuffled deck.
2. **Three different listing renderers in three different visual languages.** The in-feed listing card at `app/page.tsx:700-777` (photo with price overlay, comment-above-image), the `ListingCard` at `components/ListingCard.tsx` (carousel + reaction row + amber CTA), and the search-results `ListingFeed` view. Users see "listings" but they look completely different from card to card and view to view. Cognitive load is huge.
3. **Reaction rows show "0 0 0 0 0" everywhere** (`components/ListingCard.tsx:243-248, 258-263`). When literally every listing shows zero reactions, the row stops signaling activity and starts signaling "this site is empty." It should hide when there's nothing to show, or be replaced by a "be the first" affordance.
4. **"Spill the tea" is in 5+ places with 5+ different labels** — "Spill the tea" (`components/ListingCard.tsx:251`), "Drop your take →" (`app/page.tsx:691`), "Read all takes" (`app/page.tsx:771`), "🫖" tab, "Spill" tab text (`components/MobileNav.tsx:50`). Pick one verb, repeat it, own it.
5. **Stats bar dilutes the hero** (`app/page.tsx:566-579`). "1,234 listings · 567 takes · any city in the US" reads like a stats footer, not a hero — and "any city in the US" is meaningless to someone in Orange County. It should be geo-personalized or removed.
6. **Sticky category pills don't change anything visible.** They sit at `top-12` (`app/page.tsx:584`) but a user tapping "Most Unhinged" gets a full server reroute to `/?sort=comments`, breaking the immersive feed feeling. They should filter the current feed in place.
7. **Listing card has too many CTAs at the same visual weight** (`components/ListingCard.tsx:221-269`): takes count, reaction row, top comment, "+ N more", reaction row again, "Spill the tea" big amber button. Eye has nowhere to land. Need one primary action per card.
8. **No sense of place.** A user in Orange County gets the same homepage as a user in Nashville. There's a `GeoCategoryPill` and a `GeoFeedEnhancer` (`app/page.tsx:5-7`), but the feed below them is global. The user explicitly called this out — "shouldn't show the listings the way it's showing unless that's for all of orange county."

---

## Prioritized improvements

| # | What + why | File(s) | Complexity | Impact |
|---|---|---|---|---|
| 1 | **Quiet the listing card.** Hide zero-state reaction rows, collapse double CTAs into one primary "Spill" button, tighten vertical rhythm. The card should feel calm — one big photo, one big quote, one big button. | `components/ListingCard.tsx` | S | **High** |
| 2 | **Unify CTA copy to "Spill the tea →".** Replace "Drop your take", "Read all takes", "Spill" tab label, etc. with one verb. One brand voice. | `components/ListingCard.tsx`, `components/MobileNav.tsx`, `components/HotTakeOfTheDay.tsx` (and many others — limit this pass to owned files) | S | High |
| 3 | **Add a tactile "scroll deeper" affordance to the feed.** Right now the feed just ends. Add a subtle infinite-scroll/"next take" hint at the bottom of each card so the user feels pulled forward, plus a small parallax/reveal animation on card entry. | `components/ListingCard.tsx`, `app/globals.css` (additions only) | S | **High** |
| 4 | **Add a `WatchingNow`-style live presence pulse on the listing card** ("3 people looking now"). Cheap pseudo-randomness keyed by listing ID, refresh on visibility. Adds urgency + life. | new `components/WatchingNow.tsx`, used by `components/ListingCard.tsx` | M | High |
| 5 | **Make the Spill button on the mobile nav genuinely feel like a portal.** Add a soft pulsing halo, micro-tilt on press, and a haptic-style ripple (CSS-only). It's the most-tapped element — make it want to be tapped. | `components/MobileNav.tsx`, `app/globals.css` | S | High |
| 6 | **Replace the "1,234 listings · 567 takes · any city in the US" stats bar** with a single "live now in {city}" pulse when geo is available. If no geo, drop it. | `app/page.tsx` (owned line range only — out of scope for this pass) | S | Medium |
| 7 | **Add a "Tea Temperature" gauge** to listings with >3 takes — a 0-100 score derived from #takes × #reactions × recency. Shows on listing card and detail page. Becomes the shorthand metric the product is known for. | new `components/TeaTemperature.tsx`, `components/ListingCard.tsx` | M | **High** |
| 8 | **`NextUpCta` between cards.** Every ~3 cards, slot in a friendly "more from {neighborhood}" or "🔥 the spiciest in this zip" — keeps the user diving deeper, ties to geo. | new `components/NextUpCta.tsx`, page-level integration deferred to feed agent | M | Medium |
| 9 | **Card-entry stagger animation.** When cards mount, fade-up with a 60ms stagger. Instantly makes the feed feel premium vs. CRUD. Pure CSS, no JS. | `app/globals.css`, `components/ListingCard.tsx` | S | High |
| 10 | **Search bar focus state is too subtle.** Currently a 2px amber ring (`app/globals.css:108-110`); needs more presence — amber outer glow + scale-up on focus for "this is where the magic starts." | `app/globals.css`, `components/SearchBar.tsx` | S | Medium |
| 11 | **Reaction row visual.** When a listing has reactions, show only the ones with counts and stack them like Slack reactions (rounded chips with subtle hover lift). When zero, show a single "👀 React" affordance. | `components/ListingCard.tsx` | S | Medium |
| 12 | **Photo gallery dots** on `ListingCard` only show 5 — when there are 12 photos, users can't tell. Convert to compact `1/12` counter chip in the bottom corner instead. | `components/ListingCard.tsx` | S | Low |

---

## WOW factor moves (future passes, > one sitting)

These are the bold strokes that take Gwaky from "Zillow with comments" to "the home discovery app you can't put down":

1. **The "Spill" portal.** Tap the 🫖 in the bottom nav and instead of opening a sheet, the whole screen tilts back, a teapot pours real liquid (Lottie or pure SVG) across the screen, and the spill sheet rises through the puddle. Cinematic, ownable, three-second moment. Do once, never forget. Reduced-motion fallback = instant sheet.
2. **"Tea Temperature" as a dynamic gauge.** Every listing has a 0-100 score with a SVG dial that animates from 0 → score on scroll-into-view. Above 80, it actively steams (CSS keyframe vapor). Becomes the metric people screenshot and share. Hook this into the OG image generator so shared listing cards show the gauge.
3. **Swipe-up "Drill deeper" gesture.** Mobile-only. Swipe up on a listing card → it expands to a full-screen take stream for that listing. Swipe down to dismiss. This is the literal "dives you deeper and deeper into more and more listings" the user described — turns the feed into an Instagram-Reels-for-real-estate motion language.
4. **Neighborhood spotlight that flips like a passport stamp.** Geo-pin lockup. Card flips when in view (CSS 3D transform) to reveal a hand-illustrated neighborhood crest with the median price, the spiciest take, and a "Show me everything in {neighborhood}" CTA. Easter-egg: certain zip codes get bespoke crests.
5. **Sound design intent.** Optional, user-toggle. Subtle "spill" sloshing on Spill button press, a satisfying pop on reaction tap, a deck-shuffle whisper on feed refresh. Off by default, surfaced once in onboarding with a clear toggle. Costs ~5KB of compressed audio for the whole library — worth every byte. Use the WebAudio API for low-latency triggering.

---

## Pass-1 ship list (this PR)

Implementing **#1, #3, #9** from the prioritized list — highest impact, lowest risk, all inside owned files.
