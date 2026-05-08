# Onboarding — feat/onboarding

This branch (`feat/onboarding`) is **additive**. It does not modify
files owned by the parallel auth/comments/notifications task or the
parallel viral-UX overhaul.

## What lands here

```
app/
  onboarding/
    layout.tsx                    # stripped layout (no global nav)
    page.tsx                      # /onboarding entry
  profile/edit/
    onboarding-additions.tsx      # drop-in <OnboardingAdditions />

components/
  onboarding/
    OnboardingWizard.tsx          # 2-screen wizard (client)
    MarketTypeahead.tsx           # WAI-ARIA combobox
    NeighborhoodInput.tsx         # chip input
    ConsentBlock.tsx              # granular consent
    CompleteProfileBanner.tsx     # Tier 2 carrot banner
    CompleteProfileBannerSlot.tsx # server slot for home page
    Tier2Modal.tsx                # progressive-disclosure modal
    onboarding.css
    tier2.css
  profile/
    ProfileFieldsSection.tsx      # drop-in for /profile/edit
    PrivacyDataSection.tsx        # GDPR export + delete UI
    profile-edit.css

lib/
  onboarding/
    actions.ts                    # server actions (auth-gated)
    validation.ts                 # zod schemas
    markets.ts                    # top 50 metros + searchMarkets()
    copy.ts                       # all microcopy in one file
    getMissingTier2Fields.ts
  consent/
    recordConsent.ts              # single + bulk consent logging

prisma/
  schema.onboarding.prisma        # additive schema FRAGMENT (merge by hand)

docs/onboarding/
  user-research.md                # 3 user moments + field justification
  design-critique.md              # self-critique pass
  accessibility-review.md         # WCAG 2.1 AA scan
  SCHEMA_MERGE.md                 # how to merge into the canonical schema
  legal-templates/                # plain-English /privacy and /terms copy
    privacy.md                    # — to swap into app/privacy/page.tsx
    terms.md                      # — to swap into app/terms/page.tsx
  screenshots/                    # 390×844 mockups
  _render/                        # raw HTML used to render screenshots
```

## Collisions resolved during the run

The auth/comments/notifications task wrote files into the worktree
while this task was running. Resolutions:

| Their file | Our intent | Resolution |
|------------|------------|------------|
| `app/privacy/page.tsx` | `/privacy` plain-English copy | Saved as `docs/onboarding/legal-templates/privacy.md`. Team can swap. |
| `app/terms/page.tsx` | `/terms` plain-English copy | Saved as `docs/onboarding/legal-templates/terms.md`. Team can swap. |
| `prisma/schema.prisma` (User: `username`, `name`) | Wizard writes display name + username | Server action maps `displayName` → `name` (no schema duplication). |
| `app/profile/edit/page.tsx` | Add Tier 2 fields and privacy section | Shipped as importable `<OnboardingAdditions />`. |
| `lib/auth.ts`, `lib/prisma.ts` | Auth + DB clients | Imports match exactly — no changes needed. |

`app/(legal)/` exists in the worktree as a sandbox leftover (the
agent couldn't `rm`). The page files are stubbed with `notFound()` and
the push script excludes the folder. Delete `app/(legal)/` locally
before merging.

## Drop-in points for the parallel tasks

### Auth/comments/notifications task owns `prisma/schema.prisma`
- Merge fields, enums, and models from `prisma/schema.onboarding.prisma`.
- Migration: `pnpm prisma migrate dev --name onboarding_strategic_fields`.
- Delete `schema.onboarding.prisma` after the merge.

### Auth/comments/notifications task owns `app/profile/edit/page.tsx`
- In their page, `import { OnboardingAdditions } from "./onboarding-additions";`
  and render `<OnboardingAdditions />` in the page body.

### Viral-UX task owns `app/(home)/page.tsx`
- In their page,
  `import { CompleteProfileBannerSlot } from "@/components/onboarding/CompleteProfileBannerSlot";`
  and render `<CompleteProfileBannerSlot />` above the feed.
- The slot returns `null` for users without missing Tier 2 fields, so
  it's safe to render unconditionally.

### Auth task owns `lib/auth.ts` and `lib/prisma.ts`
- All server actions in `lib/onboarding/actions.ts` import these.
- If the auth task uses `getServerSession` instead of `auth()`, change
  the imports in `actions.ts` only.

## Strategic-data design
See `docs/onboarding/user-research.md`. Tier 1 is intentionally only
display name + username + role + market(s). Everything else lives in
Tier 2 progressive disclosure or is earned (Tier 3).

## Consent
- TOS+Privacy required, marketing default OFF, personalization default
  ON, push deferred to first push-relevant moment.
- Every change writes a `ConsentLog` row.
- IP addresses are SHA-256 hashed at write time using
  `CONSENT_IP_HASH_SECRET` (env).
