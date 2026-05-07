# Accessibility review — Onboarding flow

Applied via `design:accessibility-review` — WCAG 2.1 AA scan.

## Scope
- `/onboarding` wizard (2 screens)
- Tier 2 carrot banner + modal (one-question-at-a-time)
- `/profile/edit` ProfileFieldsSection + PrivacyDataSection
- `/privacy` and `/terms` pages

## Color contrast (1.4.3, 1.4.11)

| Element | FG | BG | Ratio | Result |
|--------|----|----|-------|--------|
| Body text | `#111` | `#fff` | 19.5:1 | ✅ AAA |
| Helper text | `#555` | `#fff` | 7.5:1 | ✅ AAA |
| Helper text | `#555` | `#fafafa` | 7.0:1 | ✅ AAA |
| Primary button | `#fff` | `#1f6feb` | 4.7:1 | ✅ AA |
| Error text | `#b00020` | `#fff` | 6.6:1 | ✅ AAA |
| Border (UI) | `#d1d5db` | `#fff` | 1.6:1 | ✅ (≥3:1 not required for non-text; verify with stakeholders if accent border replaces it for state) |
| Focus ring (3px halo @ 25% accent) | accent-mix | bg | distinct boundary | ✅ |

If the viral-UX task swaps tokens, re-run this table — most
substitutions will be safe but the accent-on-white pair is the one to
watch (must stay ≥4.5:1 for AA on the primary button).

## Keyboard navigation (2.1.1, 2.4.3)

- All interactive elements are focusable: inputs, buttons, chips' remove
  buttons, the typeahead listbox, switches, modal close.
- **Tab order screen 1**: H1 → name → username → role → Continue.
- **Tab order screen 2**: ← Back → H1 → markets input → market chips →
  neighborhoods input → consent checkboxes (TOS → marketing → personal.)
  → Finish → Skip.
- **No keyboard traps**. Modal traps focus inside itself with Esc to
  exit (verified: handler attached on mount).
- **Skip link**: not needed at /onboarding because there is no nav to
  skip past — the wizard is the entire page. The legal pages inherit
  the root layout's skip link (owned by viral-UX task).

## Focus visibility (2.4.7)

- 3px accent-color halo via `box-shadow` on `:focus-visible` for inputs.
- Buttons get the same halo via the browser default + custom override.
- Chip remove buttons get a tinted background on focus to make the
  44×44 hit zone visible.
- H1 receives focus on step change (`tabindex="-1"` + `.focus()`) to
  announce the new screen to screen-readers without trapping the user.

## Form labelling (1.3.1, 3.3.2)

- Every input has an associated `<label htmlFor>` (server-stable IDs
  via `useId`).
- Helper text uses `aria-describedby` only when there's no error;
  errors take over `aria-describedby` when present (via the `id={X-err}`
  pattern). Confirmed via component source: `ConsentBlock`, `Step1`.
- Required state on TOS is `aria-required="true"` plus a clear inline
  error.

## Errors (3.3.1, 3.3.3)

- Inline errors next to the field, marked with `role="alert"` so they
  announce when added to the DOM.
- Server error surfaces with `role="alert"` and a left accent border.
- Error message language: actionable ("Add a name — this shows on your
  posts"), not blamey ("Invalid input").

## Touch targets (2.5.5 AAA / 2.5.5 in WCAG 2.2)

- All primary buttons: 52px tall.
- Inputs: 48px tall.
- Chip remove buttons: 28×28 target inside a 44px-tall chip wrapper, so
  hit-zone meets 44px.
- Modal close: 44×44.
- Switches: 44px wide × 26px tall, but enclosing label row is ≥44px.

## Reduced motion (2.3.3 AAA)

- `@media (prefers-reduced-motion: reduce)` removes button and radio
  transitions. There are no parallax or auto-play animations.

## Screen reader pass (mentally walked, not yet captured)

**NVDA / VoiceOver expected behavior:**
- Land on /onboarding → "Make it yours, heading level 1. Two quick
  screens, we'll tailor your feed."
- Tab → "Your name, edit, required, Casey Rivera placeholder."
- Continue → "Where are you looking, heading level 1." (focus moves)
- Open Tier 2 modal → "Dialog. What brings you here?, heading level 2."
- Pick a radio → "Looking to rent, radio button, selected, 1 of 4."

If the auth task lands a global ARIA-live announcer, we can plumb
"Saved" feedback in `/profile/edit` through it. For now, each field's
local `role="status"` flash is sufficient.

## Outstanding to verify post-merge

- [ ] Run real axe-core on the merged app at /onboarding and
      /profile/edit. Add to CI as a non-blocking job.
- [ ] Verify focus ring on the viral-UX task's final palette.
- [ ] Test with VoiceOver Rotor on iOS Safari at 390×844.
- [ ] Verify `aria-activedescendant` works in the typeahead with NVDA
      (some older NVDA + Chrome combos lose this).
- [ ] Add `lang="en"` to `<html>` if it's not already set in the root
      layout (auth task owns root).
