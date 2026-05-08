# BUILD_PLAN — feat/accounts-comments-notifications

This branch ships a connected set of features around user identity, social
interaction, and notifications, plus a deploy-resilience fix.

## Why now
- The /about page does a build-time `prisma.listing.count()`. Whenever Neon
  is suspended, builds fail and the site goes down. Commit 8 makes the build
  resilient so DB outages no longer take the site offline.
- Comments were anonymous (name + email per comment). Moving to real accounts
  unlocks profiles, mentions, likes, threaded replies, notifications.

## Commit map

1. **docs** — BUILD_PLAN.md, AUTH_SETUP.md, WHEN_DB_IS_UP.md
2. **schema + deps** — Prisma additions for User/Account/Session/
   VerificationToken/Notification/SavedListing/CommentLike, plus Comment
   additions (userId, parentId, likeCount, isRedFlag, editedAt). Idempotent
   migration using IF NOT EXISTS.
3. **auth.js v5 wiring** — Conditional Google / Apple / GitHub / Resend
   providers (init only when env vars present so build is green without
   OAuth credentials). Middleware. Sign-in modal + sign-in button.
4. **profile** — /profile (auth-aware), /profile/edit, /u/[username],
   avatar upload via Vercel Blob, gradient fallback, streak badge.
5. **threaded comments** — ThreadedComments + composer, optimistic likes,
   edit / delete, red-flag toggle, hot badge, quick actions; wired into the
   listing page.
6. **notifications** — Bell + dropdown, /notifications page (infinite scroll),
   SSE stream, 30s polling fallback, mobile tab badge.
7. **mobile tab badge integration + ts cleanup** — MobileTabBadge wired
   into the bottom nav, ts-expect-error cleanup.
8. **build resilience for /about** — wrap `prisma.listing.count()` calls in
   try/catch so the build (and the page render) survives DB outages.

## Build green without DB or OAuth
Both the schema migration and the Auth.js wiring are designed so the
project builds with no DATABASE_URL, no AUTH_SECRET, and no OAuth client
IDs. Providers are initialized inside a function that returns an empty
array when env vars are missing. The migration file is committed but not
run at build time.

## Operational notes
- Push the branch as a PR. Do NOT merge to main until Vercel has produced
  a green build for the branch and the DB has been confirmed healthy.
- After merge, run the migration once via `prisma migrate deploy` (or
  through Neon's SQL editor — the file uses `IF NOT EXISTS` so it's safe
  to re-run).
