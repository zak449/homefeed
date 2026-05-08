# WHEN_DB_IS_UP — runbook for restoring DB connectivity

The /about page used to crash builds whenever the Neon compute was
suspended. As of commit 8 that's no longer fatal: the page falls back
to placeholder counts and the site keeps loading.

When the DB comes back up, do the following:

## 1. Confirm Neon compute is running
- console.neon.tech → project → Compute → status: Active
- check Vercel build logs for `Can't reach database server` errors

## 2. Run the migration
```
npx prisma migrate deploy
```
or copy `prisma/migrations/<timestamp>_accounts_comments_notifications/migration.sql`
into the Neon SQL editor. The file uses `IF NOT EXISTS` so re-running
is safe.

## 3. Trigger a redeploy
- Vercel → Deployments → latest → Redeploy → "Use existing build cache: NO"

## 4. Verify
- gwaky.com loads
- /about shows real counts
- /profile loads when signed in
- comments + notifications work end-to-end

## Rollback
The `feat/accounts-comments-notifications` branch is additive only:
no destructive changes to existing tables. The migration adds new
tables and adds nullable columns to `Comment`. To roll back the new
features without dropping data, revert the deploy in Vercel.
