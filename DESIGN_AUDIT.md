# Gwaky Design Audit

**Premise.** Gwaky has the bones of an obsessive consumer product (Spill the Tea, hot takes, streaks, real-time pulse) but the connective tissue is flat. Buttons fire into voids. Color is buried. Nothing pulls you to the next thing.

This audit catalogs every dead-end, every visual inertness, and every emotional miss against the Rich Barton bar (Zillow / Glassdoor / Expedia / Trover): power tools for consumers, addictive marketplace UX, color and motion that feel alive.

---

## 1. Dead-end CTAs (the #1 frustration)

### 🔴 Critical — Spill the Tea fires into emptiness

**Location:** Mobile bottom nav `🫖 Spill` tab → opens `SpillSheet` (`components/SpillSheet.tsx`).

**The bug as Zak described it:** Tapping Spill on `/` (home), `/saved`, `/profile`, `/notifications`, `/hot-takes`, `/red-flags`, `/trending`, `/u/[username]`, or any non-listing page opens a sheet whose only context hint is one apologetic line:

> "Pick a listing from the feed first, or drop a general take." — `SpillSheet.tsx:200`

The textarea is enabled. The role selector is enabled. The "🫖 Spill it" button is enabled. The user can post a take that targets nothing. There is **no listing context, no place selector, no way to pick a target without closing the sheet, scrolling the feed, finding a card, tapping it, then clicking Spill again from the listing page**. That's a 4-step dead-end disguised as a 1-tap CTA.

**Fix (committed in this branch):** SpillSheet pivots when there's no `listingId`. It shows a Target Picker first — recent listings the user touched, listings near them, or "Spill on the city in general" — then reveals the composer. No write-only-no-target path.

### 🟠 High — Trending / Hot Takes / Red Flags empty states have no exit

| Page | Empty-state copy | What's missing |
| --- | --- | --- |
| `/trending` | "Be the first voice. No one's started talking yet. Search any listing and drop your take to kick things off." | No button, no link. User is told to *go search* and given nothing to click. |
| `/red-flags` | "No red flags yet" | No CTA, no celebration, no inversion of the empty state into a feature. |
| `/saved` | "No saved listings yet" | No "Browse trending listings" link. Just dead. |
| `/hot-takes` | (renders comments — hot when present, but if empty it falls to the same flat copy) | Same: no next-step button. |
| `/community/[zipCode]` | "Be the first to drop a take on a listing in {zipCode}." | No Spill button. The very page that should be the most viral has no Spill trigger. |

Every one of these should end with *"the next thing pulling you in."* Today they end mid-sentence.

### 🟠 High — Profile is a dashboard with no spear

`/profile` and `/u/[username]` show comment lists, streak badge, saved count. **None of those numbers are clickable to a deeper drilldown** — the streak is decorative, the saved count is decorative, the comment count just sits there. A streak counter you can't tap into is a hallway with no door.

### 🟡 Medium — Footer "I have something to say"-energy CTAs missing

`components/Footer.tsx` exists but nothing on `/` or `/listing/[id]` says "drop your take" until the user finds the floating Spill tab. The Spill button should be reinforced in the page flow on every detail page (top of comments section, end of comments section, sticky reminder when the page scrolls past 50%) — instead it lives in one place.

---

## 2. Confusing flows (no logical next step)

### Comments don't know they're a stream

`ThreadedComments` renders threaded replies but the listing page doesn't preview *what's there before you scroll*. There's no "12 takes · 3 hot · 1 red flag" header that pulls you down. The comments live in a section users can ignore.

### `/hot-takes`, `/red-flags`, `/trending` — three pages, near-identical, no relationship to each other

A user landing on `/hot-takes` has no breadcrumb into `/red-flags` and vice versa. These should be two faces of a single "Tea Index" — `🔥 Hot now` and `🚩 Watch out` — with a unified header and switcher, not three orphan routes.

### `/profile` ↔ `/u/[username]` ↔ `/notifications`

All three involve "you." None of them link to each other beyond the bell. A profile page should surface "1 person replied to your last take" not just "0 unread" — a numeric stat that makes the bell magnetic. Today the bell is a counter with no preview.

### Spill role prompts vanish after click

When you pick `neighbor 🏠` in SpillSheet, a single rotating prompt shows up for 200ms then fades — but the prompt list is the most valuable copy in the whole app ("What does the seller NOT want buyers to know?"). The user only sees one prompt at a time, and they get hidden as soon as they type. **Lost copy.**

---

## 3. Visual inertness (the colors aren't sticky)

### Anchor color is doing 30% of its job

`#FF4D00` (burnt orange) is set as `accent` but it appears almost exclusively as **text** at full opacity, or as a tiny `bg-accent/10` background pill. The whole interface is `#0A0A0F` (cold near-black) + `#1E1E2A` (gunmetal) + `#282838` (slightly-less-gunmetal). The orange exists but it's a shy guest at its own party.

**Symptoms:**
- `text-secondary` (60% white) and `text-tertiary` (38% white) are EVERYWHERE on dark bg → text washes out.
- Hover states are mostly `hover:border-accent/30` (30% opacity = nearly invisible).
- Surface depth tiers `bg / surface / elevated` differ by ~12 RGB points — so a card on a card on a background is monotone.
- No glow rim around active CTAs.
- No color *celebration* on successful actions (post a comment → text changes).

### Motion is decorative, not narrative

`globals.css` has nice keyframes (`gwak-pulse`, `amber-shimmer`, `fade-up`, `shimmer`) but they're applied to ambient glow orbs, not to the moments that matter:

- New comments **don't slide in** when posted — the page just re-renders.
- Reaction counts **don't tick up** — they jump from 4 → 5 with no animation.
- The Hot Badge **doesn't pulse** when a comment crosses the threshold.
- The streak counter **doesn't celebrate** on a new day.
- "12 people are watching this listing" — **doesn't exist**.

### Cards have no body language

`ListingCard` hover state: `hover:shadow-soft`. That's the entire interaction. No tilt, no lift, no border accent, no rim glow, no caption reveal, no preview of what's inside. A consumer marketplace card needs a tiny amount of visible appetite — a "I have stuff to show you" twitch.

### Typography hierarchy collapses at the body level

Strong `Bebas Neue` display font for headlines, fine. But every body sentence is `Space Grotesk` at 0.875rem in `text-secondary`. Captions, timestamps, hints, and prose all live at the same rough visual weight, which means the eye has nowhere to rest and nothing to chase.

---

## 4. Navigation that doesn't lead one logical place to the next

### Mobile nav: 5 tabs, only 1 has gravity

`components/MobileNav.tsx` — Feed / Hot Takes / **Spill** / Saved / Profile. The Spill button is the gravity well (large, accent, center). Good.

But:
- **Feed** never says "you have unread takes on listings you saved" — no badge.
- **Hot Takes** never previews "🔥 +24 takes today vs yesterday" — no momentum.
- **Saved** never says "3 of your saved listings just got new tea" — no return signal.
- **Profile** has the notification badge — but it's a count, not a teaser. ("2 replies on your '4317 Mariposa' take" would be 100x more clickable than `2`.)

Four of five tabs are inert containers. Only one earns the tap.

### Desktop nav (NavLinks) is utility-only

`components/NavLinks.tsx` is 65 lines of hover-styled links to `/`, `/hot-takes`, `/saved`, `/profile`. Zero of those links carry status. Zero of them tease content.

### Cross-page navigation ends, doesn't continue

- `/listing/[id]` has "Related listings in {city}" at the bottom. ✅
- `/hot-takes` has nothing at the bottom. ❌
- `/red-flags` has nothing. ❌
- `/trending` has nothing. ❌
- `/saved` has nothing. ❌
- `/profile` has nothing. ❌
- `/notifications` has "Back to profile" — a backwards CTA. ❌

Every page should end with the next thing pulling you in. Six of nine top-level routes don't.

---

## 5. Power tools that haven't been built yet

Rich Barton's playbook: give consumers a **hero artifact** they can't get anywhere else. Zestimate, Salary Snapshot, Bundle and Save. Gwaky has the *ingredients* but no synthesized hero metric.

| Existing component | What it shows | Why it's not a power tool |
| --- | --- | --- |
| `CommunityPulse` | Text: "X opinions · Y reactions · Z listings" | Plain caption. Not interactive. Not visual. Not a number you'd screenshot. |
| `GeoPulseBar` | "X takes near you" + 1 ping dot | Live but trendless. No direction, no context. |
| `HotTakeOfTheDay` | Top comment from last 7 days | Decent seed, but it's *one* comment, not an index. |
| `PriceInsight` | Price/sqft verdict on a gradient bar | Closest to a Zestimate-style artifact. Visual, opinionated. But narrow (price-only) — doesn't capture the *gossip* that is Gwaky's whole edge. |

**The missing hero:** a per-listing **Tea Temperature** — a 0–212°F gauge that combines volume, sentiment, recency, and source diversity into a single, screenshottable, opinionated number. (Implementation in this branch — see `components/TeaTemperature.tsx`.)

---

## 6. Microcopy that whispers when it should sing

| Where | Today | Issue |
| --- | --- | --- |
| `/saved` empty | "No saved listings yet" | Flat. Should pivot to action. |
| `/red-flags` empty | "No red flags yet" | Misses celebration ("This block looks clean. Spot something? Drop a 🚩"). |
| `/trending` empty | "Be the first voice." | No button. |
| SpillSheet no-target | "Pick a listing from the feed first, or drop a general take." | Apologetic. Should be a *picker*, not a sentence. |
| Notification empty | (default count) | Should be "All caught up. Catch up on 🔥 hot takes →". |
| Auth modal | "No password — drop a take in seconds." | Decent hook. Misses the streak/badge magnet. |
| `/u/[username]/not-found` | "No one's here" | Off-brand. |
| Comment edit/delete | "Edit" / "Delete" | Utilitarian. Brand voice is "spill / unspill / refine your tea". |
| Post-success | "Tea spilled. Your take is live. The block will never be the same." | Strong! Keep this voice everywhere. |

The voice exists. It's just not consistent. The `Tea spilled.` moment is the brand. The rest of the app forgets.

---

## 7. Streaks, badges, social proof — built but invisible

- `StreakBadge` renders only on `/profile` and `/u/[username]`. **Not on the home feed**, **not on the listing page next to a comment**, **not on the Hot Takes page**. So the user with a 14-day streak gets zero social-proof reward where it matters (next to their take).
- `HotBadge` renders inside `ThreadedComments` only. **Not on `/hot-takes`** (which queries comments via SQL and renders them as static markup). Same comment, same data, two surfaces, badge missing on one. Inconsistent.
- `MobileTabBadge` shows unread count on Profile tab. No equivalent for "new replies on your takes" on Feed, no equivalent for "new red flags in your saved" on Saved.

The system is built. The surfacing is missing.

---

## 8. Accessibility flags spotted in passing

(Full WCAG 2.1 AA pass coming in a later commit — these are the obvious ones.)

- `text-tertiary` (rgba(255,255,255,0.38)) on `bg-bg` (#0A0A0F) — contrast ratio ~3.6:1, **fails AA for body text** (needs 4.5:1).
- `text-secondary` (rgba(255,255,255,0.60)) on `bg-bg` — ~6.0:1, passes AA but barely; on `bg-elevated` (#282838) it's ~5.4:1 — passes but tight.
- Mobile nav tap targets: 44px minimum (icon + label = 56px wrapper). ✅
- SpillSheet textarea has no aria-label.
- Notification bell icon — needs aria-live region for new arrivals.
- Streak badge uses 🔥 emoji as icon — needs `aria-label="14 day streak"` etc.
- Focus ring exists (`:focus-visible`) but at 50% opacity — should be solid for AA.

---

## Punch list (priority order)

1. **Kill the Spill dead-end.** SpillSheet without listing context becomes a Target Picker (recent + nearby + "city in general"). No unhomed posts.
2. **New anchor color** — Tea Magenta (`#FF2E93`) + Lime Spill (`#C8FF3E`) accent pair. Replaces the underused burnt orange. Distinctively NOT corporate-real-estate-blue/green/red.
3. **Tea Temperature gauge** — per-listing 0–212°F hero metric, shareable, screenshottable. Lives at the top of every listing page.
4. **Live ticker components** — `<LiveCount />` that animates on count change; `<RecentSpillStream />` showing the latest comments streaming in on the home page.
5. **Surface streaks + hot badges everywhere** — feed, listing page, hot-takes page, comment thread.
6. **Microcopy pass** on every empty state and CTA so each one ends with the next thing pulling you in.
7. **Mobile nav badges** — every tab earns a numeric teaser, not just Profile.
8. **WCAG 2.1 AA** sweep on the new color tokens and components.

— audit complete. Vision and tokens land in `DESIGN_VISION.md` and `tailwind.config.ts` next.
