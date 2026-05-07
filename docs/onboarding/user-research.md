# Gwaky Onboarding — User Research Frame

Applied via `design:user-research`. This document is the source-of-truth for **why** each
field exists. If a field can't justify itself against one of the three moments below, it
should be cut.

---

## The 3 user moments this onboarding optimizes for

### Moment 1 — "Why am I here?" (first 30 seconds)
The visitor arrived via a TikTok / X / Reddit post about a building, a market, or a
tip-off thread. They're skeptical: another app trying to be Zillow? They will bounce in
under a minute if friction outpaces curiosity.

**What they need:** proof Gwaky knows their market, low-cost commitment, no credit-card-style form.

**What we ask:** display name, username, role, primary market. Nothing else.

**Field justification:**
- **Role** — The single most powerful segmentation lever in the product. Glassdoor's
  early bet. A "Renter in Brooklyn" sees a different feed than a "Broker in Brooklyn"
  forever, and we can never recover this signal cheaply later.
- **Primary market(s)** — The feed is dead without it. Asking on screen 2 (not 1)
  because pulling up a city list is more cognitive load than typing your name.
- **Display name + username** — Required for posting/commenting. Both because some
  users want a real name on their profile and a handle for tagging.

**Field cuts (asked elsewhere or never):**
- ❌ Phone number — high-friction, not needed until 2FA-gated actions
- ❌ Birthday — only needed if we add age-gated content; collect at that moment
- ❌ ZIP code — primary market is more useful and humans know their city, not their ZIP
- ❌ "How did you hear about us?" — moved to Tier 2; not blocking signup
- ❌ Budget at signup — wildly invasive at moment 1; moved to Tier 2 with a "carrot"
- ❌ Avatar required — cognitive cost > value; gradient fallback exists

### Moment 2 — "Was this worth it?" (first session, 2–10 min)
They've signed up. Feed loads. Did the first scroll feel like *their* market?

**What they need:** a feed that looks like it was built for them, an unobtrusive prompt
to deepen their profile if they want better recommendations.

**What we ask (Tier 2 carrot):** intent, timeline, watchlist seed, referral source,
notification cadence. **One question at a time, skippable.**

**Why progressive disclosure here, not at signup:**
- Buyers don't have a budget number until they've shopped 2 weeks. Asking at minute 0
  forces a fake answer that pollutes the model.
- "How did you hear about us?" attribution data is stronger when collected after the
  user has decided to stay (selection bias smaller).

### Moment 3 — "Do I trust them with this?" (return visit, after they post)
They've commented or saved a building. Now they care about privacy. They want to know
if their watchlist is visible, what the company does with their data, and whether they
can leave.

**What they need:** every collected field visible in /profile/edit, clear public/private
toggles, a delete-account flow, an export-my-data flow.

**What we ship:** privacy-by-default for sensitive fields (budget, watchlist), explicit
granular consent at signup (not bundled), per-field privacy toggles in /profile/edit,
and a real GDPR/CCPA delete + export flow.

---

## Information architecture decisions

| Field | Tier | Required? | Default privacy | Why this tier |
|-------|------|-----------|-----------------|---------------|
| Email | 0 (Auth.js) | Yes | Private | Already collected by Auth |
| Display name | 1 | Yes | Public | Identity for posts |
| Username | 1 | Yes | Public | @-mentions, profile URL |
| Role | 1 | Yes | Public | Segmentation forever — cheap to ask, expensive to recover |
| Primary market(s) | 1 | Yes | Public | Feed will not work without it |
| Avatar | 1 | No | Public | Gradient fallback exists |
| Neighborhoods | 1 | No | Public | Optional refinement of market |
| Buy/Rent intent | 2 | No | Private | Premature at signup; honest answer requires shopping context |
| Intent timeline | 2 | No | Private | Same as above |
| Budget band | 2 | No | **Private (always; never shown publicly)** | Sensitive even if bucketed |
| Watchlist | 2 | No | **Private by default** | User can toggle public per-building |
| Referral source | 2 | No | Private | Attribution only — internal use |
| Notification cadence | 2 | No | n/a | Preference, not profile data |
| Trust score | 3 | Derived | Public (numeric) | Earned, not declared |
| Streak | 3 | Derived | Public | Earned |
| Hot/Red flag tags | 3 | Derived | Public | Earned |

---

## Consent design (granular, not bundled)

Four consent surfaces at signup, three at separate explicit checkboxes:

1. **TOS + Privacy Policy** — required. One checkbox, two links.
2. **Marketing email** — optional, default OFF.
3. **Personalization** — optional, default ON, with one-line explanation: "Use my role
   and markets to rank what I see. You can turn this off anytime."
4. **Push notifications** — optional, **default OFF**, and the actual browser push
   prompt only fires the first time a user does something where push is useful (e.g.
   subscribing to a building thread). Not at signup.

Every consent change writes a row to `ConsentLog` with timestamp, type, value, and
optional ipAddress/userAgent. This is the GDPR audit trail.

---

## Anti-patterns we are avoiding

- ❌ A 7-step wizard with progress bar implying you must finish (we cap at 2 screens)
- ❌ "Skip" hidden in tiny grey text (skip is a primary text button on screen 2)
- ❌ Bundled consent ("By signing up you agree to receive marketing emails")
- ❌ Asking budget at signup
- ❌ Pre-selecting the marketing-email checkbox
- ❌ Hiding the delete-account link three menus deep
- ❌ "Complete profile" nag that can't be dismissed
- ❌ Asking the same question in Tier 1 and Tier 2

---

## Success metrics (post-ship)

- **Activation rate**: % of new accounts that complete Tier 1. Target ≥ 85%.
- **Tier 2 completion within 7 days**: target ≥ 40%.
- **Role distribution sanity**: each role > 2% (else dropdown is wrong).
- **Consent revocation rate**: track per-consent-type to detect dark-pattern complaints.
- **Time-to-first-post**: should drop after onboarding ships (better feed → engagement).
