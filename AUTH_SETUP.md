# AUTH_SETUP — Auth.js v5 wiring

This branch wires Auth.js v5 with four optional providers. Each provider
initializes only when its required env vars are present, so the build
stays green even before any provider is configured.

## Required env vars (eventually)
- `AUTH_SECRET` — generated, e.g. `openssl rand -base64 32`
- `AUTH_URL` — e.g. `https://gwaky.com`
- `DATABASE_URL` — Neon Postgres pooled connection
- `DATABASE_URL_UNPOOLED` — Neon direct connection (for migrations)

## Providers

### Google
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

### Apple
- `AUTH_APPLE_ID`
- `AUTH_APPLE_SECRET`

### GitHub
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

### Email (Resend)
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM` — e.g. `noreply@gwaky.com`

## Local dev
1. Copy `.env.example` to `.env.local`.
2. Set `AUTH_SECRET` and the providers you actually want to test locally.
3. `npm run dev`.

## Production
Add the env vars in the Vercel project settings (Environment Variables).
Set them at Production scope. Redeploy.

## Notes
- `lib/auth.ts` exports `auth`, `signIn`, `signOut`, and the route handlers.
- `middleware.ts` protects `/profile/*` and `/notifications`.
- The PrismaAdapter is wired but inert when DATABASE_URL is missing.
