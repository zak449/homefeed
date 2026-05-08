# Schema merge guide

This branch (`feat/onboarding`) intentionally does **not** edit
`prisma/schema.prisma`. The auth/comments/notifications branch owns that file.

When merging this branch into `feat/accounts-comments-notifications`:

1. Open the canonical `prisma/schema.prisma`.
2. Append the enums from `prisma/schema.onboarding.prisma` (Role,
   BuyRentIntent, IntentTimeline, ReferralSource, DigestCadence, ConsentType).
3. Append the new models (ConsentLog, WatchlistItem, DataExportRequest,
   AccountDeletionRequest).
4. Inside the existing `User` model, add the field block commented in
   `schema.onboarding.prisma`. All fields are nullable or defaulted.
   - **Reuse, don't duplicate**: the auth task already added `username`
     (`@unique`) and `name`. The onboarding wizard writes its
     "display name" to the existing `name` column (the server action
     already does this) — do not add a `displayName` column.
   - The `image` and `avatarUrl` columns are also already there;
     onboarding doesn't need any new avatar field.
5. Run:
   ```bash
   pnpm prisma format
   pnpm prisma migrate dev --name onboarding_strategic_fields
   ```
6. Delete `prisma/schema.onboarding.prisma` once the merge is in.

The migration is purely additive (no column drops, no type changes), so it
is safe to run on a database that already has accounts created by the auth
task.
