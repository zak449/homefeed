# Gwaky Design Vision

> **The bar.** Power tools for consumers. Color and motion that feel alive. Every interaction has a clear next thing pulling you deeper. Naming is marketing — the words on screen are the product. Speed of the loop is the moat.
>
> Channels Rich Barton's Zillow / Glassdoor / Expedia / Trover playbook, applied to neighborhood gossip.

---

## Brand emotion

Gwaky is **the corner of the internet where the truth gets whispered**. Not corporate, not aspirational, not Pinterest-pretty. It's a friend with a screenshot. It's the group chat with receipts. It's the listing's *real* description.

The interface should feel:

- **Hot** — saturated color, live counters, things ticking up while you watch.
- **Specific** — every metric has a number, every number has a verdict, every verdict has a source.
- **Conspiratorial** — voice is "between us," never marketing-y. Empty states celebrate. Errors confess.
- **Fast** — every screen ends with the next thing pulling you in. No dead ends.

If Zillow is the polite real-estate showroom and Redfin is the no-nonsense MLS reader, Gwaky is the **block-party WhatsApp group with a search bar**.

---

## Anchor color: Tea Magenta

```
#FF2E93  ← anchor (Tea Magenta)         "the spill"
#C8FF3E  ← positive accent (Lime Spill)  "verified, hot, streaking"
#FFF7E8  ← steam (Warm White)            "highlight, cream"
#FF3B3B  ← red flag                     "watch out"
#5EEAD4  ← trust (Mint)                  "verified neighbor"
#0F0A14  ← bg (Tea Stain)                "warm-ink near-black, not cold"
#181221  ← surface
#231A2E  ← elevated
```

**Why magenta?** Zillow owns blue. Glassdoor owns green. Redfin owns red. Trulia owns greenish-blue. **Hot magenta is unclaimed in real-estate** and it does three things at once:

1. **Viral / screenshottable.** The Tea Temperature gauge in magenta is instantly recognizable in a tweet, a Reels overlay, a TikTok screen recording. Magenta cuts through the gray of every other property app on your phone.
2. **Gossip energy.** It's the color of a highlighter, a hot-pink Sharpie, a "secret revealed" Post-It. It says "this is the juicy part" without saying it.
3. **Warm against dark.** On `#0F0A14` (slightly purple-warm near-black), magenta sings. The current `#FF4D00` orange + cold `#0A0A0F` was chromatically dissonant — orange pulls toward yellow-green, the bg pulled toward blue.

**Why Lime Spill as positive accent?** Robinhood/Cash App proved that acid lime reads as "money / win / streak" instantly on a dark UI. We use it for streak counters, verified badges, "boiling" tea (212°F+), and any "you did the thing" moment.

The magenta + lime pair is the brand. Like Spotify green + black. Anyone who has seen the app once should be able to identify it by the color pair alone.

---

## The hero "power tool" — Tea Temperature

Every Rich Barton product has one number you can't get anywhere else, that the user trusts, that the user shares.

- Zillow → **Zestimate** (a $ value)
- Glassdoor → **Salary Snapshot** (a $ range + percentile)
- Trover → **Trip Score** (a 0–100)
- Cars.com → **Fair Price**

For Gwaky: **Tea Temperature.** A 0–212°F per-listing gauge derived from comment volume, sentiment, recency, source diversity. Color-mapped:

| °F | Color | Verdict |
| --- | --- | --- |
| **< 80°F** | cold blue-gray | "Cold — no one's talking yet" |
| **80–140°F** | warm pink | "Warm — early takes coming in" |
| **140–200°F** | Tea Magenta | "Hot — neighbors are spilling" |
| **200–212°F** | Lime Spill (boiling) | "BOILING — must-read receipts" |

It lives **at the top of every listing page**, screenshottable as a 1080×1920 share card, openly opinionated, with a one-line AI-generated verdict: *"BOILING. 47 takes in the last 7 days, mostly red flags about the foundation. 6 verified neighbors agree."*

This is what users tweet. This is what gets sent in iMessages. This is the **shareable power-tool moment.** Implemented in `components/TeaTemperature.tsx`.

---

## Surface-by-surface power-tool moment

Every surface earns one hero metric:

| Surface | Hero artifact |
| --- | --- |
| **Home `/`** | `RecentSpillStream` — a live-streaming ticker of the newest takes city-by-city, with a counter that climbs while you watch. (*"+3 spills in the last 4 minutes"*) |
| **Listing `/listing/[id]`** | **Tea Temperature** gauge + 1-line verdict at the top. Above the photos. The thing the user came for. |
| **Hot Takes / Trending** | "Today's Top Spill" hero card with reaction count animating up, plus a unified `🔥 Hot now` / `🚩 Watch out` switcher (replaces three orphan pages). |
| **Profile / `/u/[username]`** | **Streak ring** + **Trust score** + clickable counters. (*Saved · Spills · Hot takes · Streak* — all tappable.) |
| **Notifications** | "Inbox preview" — the bell shows the actual *first line* of the most recent reply, not just a count. |
| **Saved** | **"What's new on your watchlist"** — saved listings sorted by *new tea since you last looked*, not by save date. |
| **Spill** | **Target Picker first** when no listing is selected. Browse-to-spill, never blank-textarea-floating. |

---

## The 3 most addictive loops we want users in

### Loop 1: "I just heard a rumor → I want to know what others are saying"

Discovery → search address → land on listing → see Tea Temperature (210°F BOILING) → scroll into hot takes → react → leave a take of their own → notification when someone replies → return.

**Time-to-first-dopamine: < 8 seconds from cold open.** Tea Temperature does this at the top of the page before the photos load.

### Loop 2: "I have intel → I want it credited and amplified"

Spill → role-tag (neighbor/past renter/almost bought) → post → see Hot Badge appear when it crosses 10 likes → see streak counter increment → push notification when reply lands → return to defend or expand.

**Magnet:** the Hot Badge on their take, visible to *everyone who reads it everywhere it appears* (feed, listing page, hot-takes page, profile). Today the badge is rendered in only one place. We fix that.

### Loop 3: "I'm on the watchlist → I want to know when something heats up"

Save listing → push/email notification when Tea Temperature crosses a threshold (Cold → Warm, Warm → Hot, Hot → Boiling) → return to read what changed → re-engage.

**Magnet:** "+12°F today" delta indicator on Saved. Saved becomes a thermometer dashboard, not a static folder.

---

## The 6 micro-mechanics that make it sticky

1. **Live counters.** Reaction counts, comment counts, streak counts — all animate ↑ on change. Never jump.
2. **Streaming feed.** New comments slide in from the top of the listing page in real time, with a `+1 NEW` magenta pill that pulses until clicked.
3. **Streak ring.** Replaces flat streak number on profile. A circular progress ring with the day count in the center, lime-glow when active. Visible on every comment the user has posted.
4. **Hot-Boiling badge cascade.** When a comment hits 10 likes → 🔥 Hot Take. When it hits 50 → 🌶️ Boiling. When it hits 100 → 💎 Receipts (rare, gilded). Each tier is a different color, all in the brand palette.
5. **Watching-now indicator.** On every listing detail page: "**12 people reading this listing right now**" (server-sent, presence-based). Social proof that costs us nothing and prints engagement.
6. **Tea Temperature delta.** Saved listings show `+18°F since you saved this`. The delta is the news. The number that moves is the magnet.

---

## Naming — the words ARE the product

Audit of brand terms. **Keep / kill / coin.**

| Today | Status | New |
| --- | --- | --- |
| Spill the tea | **Keep** | The voice. Don't water it down. |
| Hot Take | **Keep** | But surface it everywhere, not just the badge. |
| Red Flag | **Keep** | Make it a 🚩 toggle on every comment. |
| Streak | **Upgrade** | "Spill Streak" — a named streak with a verb. |
| Notifications | **Rename** | "**The Group Chat**" — the bell icon opens "your tea." |
| Saved | **Rename** | "**Watchlist**" — a thing that can heat up, not a folder. |
| Profile | **Keep** for now | Eventually: "**Your spills**". |
| Trending | **Merge** into Hot Takes | Three pages → one tab with switcher. |
| Community | **Rename** | "**Block**" or "**The Block**" — your verified neighborhood. |
| Comment | **Internally call them** | "**Takes**" or "**Spills**" everywhere. |
| Sign in | **Reframe** | "**Get the tea**" / "**Join the Block**" |
| Empty state | **Reframe as event** | "Cold. Nobody's spilled here yet — be the first 👀" |

The product is built around *nouns that don't exist anywhere else*. Lean into them.

---

## Speed of the loop — every page ends with traction

Rule: **no page ends in a footer.** Every page ends with a magenta CTA pulling the user to the next thing.

| Page | Today's terminal frame | Tomorrow's |
| --- | --- | --- |
| Home `/` | Footer | "🔥 Catch up on the 5 boiling listings →" |
| Listing | Related listings (✅ keep) | + Tea Temp delta on the related cards |
| Hot Takes | Footer | "🚩 See what neighbors are flagging →" |
| Saved | Footer | "🌡️ 3 of your watchlist heated up today →" |
| Profile | Footer | "🫖 Your tea has new replies →" |
| Notifications | "Back to profile" | "🔥 What's boiling now →" |
| Empty Spill | "Pick a listing first" | Target Picker grid + "Spill on the city" |

---

## What ships in this branch (`feat/viral-design`)

1. **`tailwind.config.ts`** — full token overhaul: anchor magenta, lime accent, warm-ink bg, surface tiers with real depth, motion timings, new shadows with magenta glow.
2. **`app/globals.css`** — new keyframes (`tea-pulse`, `count-up`, `boil`, `spill-in`, `streak-ring`), brand selection color, focus ring, scrollbar.
3. **`components/TeaTemperature.tsx`** — the hero gauge, with a `<TeaTempPill />` compact variant for cards.
4. **`components/LiveCount.tsx`** — animated number ticker.
5. **`components/RecentSpillStream.tsx`** — streaming home-page feed of latest spills.
6. **`components/SpillSheet.tsx`** — Target Picker mode when no listing context.
7. **`components/MobileNav.tsx`** — tab badges that *tease content*, not just count.
8. **Empty-state and CTA microcopy pass** across `/saved`, `/red-flags`, `/trending`, `/hot-takes`, `/profile`, `/notifications`, SpillSheet, and ListingCard.
9. **Streak / Hot Badge surfacing** on listing comments and feed, not just profile.
10. **WCAG 2.1 AA** check on the new tokens before commit.

— Vision complete. Tokens next, then the build.
