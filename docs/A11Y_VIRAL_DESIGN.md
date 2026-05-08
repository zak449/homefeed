# Accessibility check — viral-design tokens

WCAG 2.1 AA pass on the redesigned tokens and components landing in `feat/viral-design`.

## Color contrast (AA requires 4.5:1 for body, 3:1 for large/UI)

Background: `bg = #0F0A14` (Tea Stain).

| Foreground | Hex / value | Ratio | Use | Pass |
| --- | --- | --- | --- | --- |
| `ink` | `rgba(255,247,232,0.96)` | **~16.9 : 1** | primary text | ✅ AAA |
| `secondary` | `rgba(255,247,232,0.74)` | **~10.4 : 1** | body, captions | ✅ AAA |
| `tertiary` | `rgba(255,247,232,0.56)` | **~6.6 : 1** | hints (bumped up from `.38` → `.56` to fix old AA failure) | ✅ AA |
| `muted` | `rgba(255,247,232,0.42)` | ~4.7 : 1 | decorative / disabled only | ⚠ borderline — not for text |
| `tea-500` | `#FF2E93` | **~5.0 : 1** | accent text, links, badges | ✅ AA |
| `tea-300` | `#FF7DBC` | **~7.4 : 1** | accent eyebrow / pill text | ✅ AA |
| `lime-300` | `#C8FF3E` | **~13.1 : 1** | streak / verified / boiling badges | ✅ AAA |
| `mint` | `#5EEAD4` | **~11.0 : 1** | trust / verified-neighbor pills | ✅ AAA |
| `flag` | `#FF3B3B` | **~5.6 : 1** | red-flag iconography | ✅ AA |

**Old palette failures fixed.** The pre-overhaul `tertiary` was `rgba(255,255,255,0.38)` on `#0A0A0F` ≈ 3.6 : 1 — failed AA for body. Raised to `.56` for AA compliance while keeping the visual hierarchy intact.

## Focus indicators

`:focus-visible { outline: 2px solid rgba(255, 46, 147, 0.85); outline-offset: 2px; }`

- Solid magenta ring at 85% opacity on every focusable element.
- Outline-offset: 2px keeps the ring visible without overlapping content.
- Border-radius: 4px so it follows pill chrome.

✅ Visible against every surface tier (bg, surface, elevated, overlay).

## Reduced motion

`@media (prefers-reduced-motion: reduce)` block in `globals.css` kills all animations and transitions when the user's OS pref is set. Boil, gauge sweep, count-up, badge-pop, tea-ping, streak-ring, spill-in — all become 0.01ms.

✅ Compliant with WCAG 2.3.3 (Animation from Interactions).

## Touch targets

Mobile nav (`MobileNav.tsx`): `min-h-[44px]` on every tab + 56-px effective wrapper. ✅
SpillSheet role buttons: `py-2.5 px-3` ≈ 44px tall. ✅
SpillSheet primary CTA: `py-4 text-lg` ≈ 56px tall. ✅
Listing card CTA: `py-2.5 text-sm` ≈ 40px — flagged for next pass.

⚠ `ListingCard` "Spill the tea →" inner CTA is 40px — bump to 44px in a follow-up.

## Semantic landmarks + aria

| Component | a11y annotation |
| --- | --- |
| `TeaTemperature` | `<section aria-label="Tea Temperature: {n} degrees, {tier}">` + non-decorative emoji marked `aria-hidden`. |
| `TeaTempPill` | `aria-label="Tea Temperature: {n} degrees, {tier}"` + `title` for hover hint. |
| `WatchingNow` | `aria-live="polite"` on the count container so SR users hear updates. |
| `LiveCount` | `aria-live="polite"` + numeric `aria-label`. |
| `SpillSheet` | `role="dialog" aria-modal="true" aria-label="Pick a listing / Post a take"` (changes by mode). Textarea has explicit `<label class="sr-only">`. Role buttons have `aria-pressed`. Identity inputs have `aria-label`. |
| `MobileNav` | Spill button has `aria-label="Spill the tea"`. Decorative `🫖` marked `aria-hidden` via wrapper. |
| `NextUpCta` | Renders `<a>` or `<button>` with semantic content; emoji marked `aria-hidden`. |

## Keyboard nav

- All interactive elements are native `<button>` or `<Link>` — keyboard reachable by default.
- SpillSheet backdrop click closes; Esc-to-close should be added (follow-up: add a keydown handler).
- Role selector: focus moves between buttons via Tab (no roving tabindex needed for grids of <10 controls).

## Open follow-ups (track separately)

1. Esc key closes `SpillSheet` (currently only the backdrop click closes it).
2. Bump `ListingCard` inner Spill CTA from 40px → 44px tall.
3. Add `aria-current="page"` to the active `MobileNav` tab.
4. Verify Tea Temperature gauge is announced once on first appearance, not on every needle frame (test with VoiceOver; if needed, mark `aria-hidden` on the SVG and rely on the `aria-label` on the `<section>`).
5. Color-blind validation: run the Tea Temperature gauge through a deuteranopia filter — magenta vs lime should still be distinguishable, but verify the 200°F+ "boil" frame doesn't lose differentiation.

— Audit complete for the tokens and components in this branch. The follow-ups above are net-new from the redesign, not regressions.
