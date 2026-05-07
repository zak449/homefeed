# Self-critique pass — Onboarding wizard

Applied via `design:design-critique`. Read the output of the wizard
against the heuristics below; cuts and fixes are inline.

## Heuristics applied

1. **Hierarchy** — what's the one thing you should look at first on each
   screen? Is the primary action the most prominent element?
2. **Consistency** — same field shape across all rows? Same vertical
   rhythm? Same focus ring? Same label style?
3. **Cognitive load** — how many decisions on each screen? Are any of
   them avoidable?
4. **Scannability** — can a returning user re-find a control in <2s?
5. **Forgiveness** — easy to back out, easy to fix mistakes, no
   unrecoverable states.
6. **Mobile fit** — does anything overflow at 320px? Do all targets
   meet 44×44px?
7. **Trust signals** — does the form FEEL like it cares about the user?

## Findings + fixes

### ✅ Hierarchy is clean
- One H1 per screen (focusable for screen-reader landing).
- Primary CTA is the only filled button on each screen.
- Skip on screen 2 is a ghost button — visible, not loud.
- Consent block is bordered and below the field cluster — easy to find,
  doesn't compete with name input.

### ✅ Consistency
- Every field uses `.of-input` / `.of-label` / `.of-helper` triplet.
- Same focus ring everywhere (3px accent halo).
- Vertical rhythm: 18px between fields, 6px between label and helper.
- Error messages share class `.of-error`, role="alert", and adjacency
  to the field they describe.

### ⚠️ Cognitive load — fixed
- **Original instinct:** show all consent checkboxes pre-checked.
  **Fixed:** marketing default OFF, personalization default ON (with a
  one-line "what does this do" inline), TOS unchecked (must be active).
- **Original instinct:** ask budget on screen 2. **Fixed:** moved to
  Tier 2 carrot — see `user-research.md` for rationale.
- **Original instinct:** ask phone for "account recovery". **Cut.** Not
  required and the friction cost is huge.

### ⚠️ Forgiveness — fixed
- Step 2 has a back button (top-left, 44×44 hit area, "← Back"
  affordance) — not just relying on browser back.
- Skip button writes minimal data and lands the user on the home page
  with the Tier 2 carrot ready. They aren't stuck.
- Username uniqueness errors return inline at the field (server action
  surfaces the error, client jumps back to step 1 if needed).

### ⚠️ Mobile fit — fixed
- Tested mentally at 320px (iPhone SE 1st gen): MarketTypeahead chips
  wrap correctly via `flex-wrap`. Listbox uses `position: absolute` so
  it doesn't push layout. CSS `100dvh` handles iOS Safari URL bar.
- All buttons 52px tall (above 44px min). Chip remove buttons 28×28
  but inside a 44px-tall chip that handles the hit area.
- `font-size: 16px` on inputs prevents iOS zoom-on-focus.

### ⚠️ Trust signals — fixed
- Each consent has a **why we ask** line in plain English, not legalese.
- "Privacy-by-default" sentence at the bottom of the consent block
  signals our defaults out loud.
- TOS + Privacy links open in a new tab so the user doesn't lose form
  state.

## What we didn't do (and why)

- **No social-proof badge** ("Join 12,432 New Yorkers"). At MVP we
  don't have the numbers. Padding numbers is dishonest and erodes
  trust the moment a user notices.
- **No animated illustration**. Two screens; an illustration is
  decoration, not signal.
- **No "auto-detect my city" button**. Geolocation prompt at signup is
  a famous source of bounces. The typeahead is fast enough.
- **No explicit "save progress and finish later"**. Two screens. If we
  added more, this would matter.

## Items the viral-UX task can polish post-merge

- Replace gradient avatar fallback with their final palette.
- Substitute typography tokens once landed.
- Optionally animate dot transitions when moving between steps.
- Optionally add a "Welcome to Gwaky, [name]" toast on home arrival.

## Items NOT for the viral-UX task

- **Don't bundle consent.** This is a legal requirement, not aesthetic.
- **Don't move "skip" off screen 2.** Earning the data over time is
  the whole strategy.
- **Don't hide "why we ask" microcopy** to clean up visual noise. The
  whole reason these copy lines exist is the trust signal.
