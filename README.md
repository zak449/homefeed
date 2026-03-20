# gwakgwak

A fun, color-blocked social real estate site. Browse homes for sale and rent, comment on listings, react to each other's thoughts, and message listing agents directly.

---

## Quick Start

### 1. Install Node.js

If you don't have Node.js installed, install it from [nodejs.org](https://nodejs.org) (LTS version recommended). Or via nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
```

### 2. Install dependencies

```bash
cd gwakgwak
npm install
```

### 3. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` to a running Postgres instance. If you don't have Postgres locally, you can use a free cloud database from [Neon](https://neon.tech) or [Supabase](https://supabase.com).

Example for a local Postgres:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/gwakgwak"
```

### 4. Set up the database

```bash
# Create tables
npm run db:migrate

# Seed with 20 demo listings
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see 20 color-blocked listing cards.

---

## Features

- **Color-blocked listing cards** — each card gets one of 6 bold accent colors
- **Search & filter** — by city/zip, sale vs rent, property type, price range, bedrooms
- **Listing detail page** — photo carousel, stats, description, agent card
- **Comments** — social feed with emoji reactions (❤️ 🔥 😂 😮 💭), no login required
- **Email alerts** — reaction notifications and new comment alerts (requires Resend key)
- **Agent contact form** — sends message directly to the listing agent's email

---

## Email Setup (optional)

Get a free API key at [resend.com](https://resend.com) and add it to `.env`:

```
RESEND_API_KEY="re_..."
EMAIL_FROM="gwakgwak <hello@yourdomain.com>"
```

Without this, contact forms and comment alerts are silently skipped (no errors).

---

## Real Listing Data

The app ships with 20 realistic demo listings. To connect real data:

### Zillow (Bridge Interactive API)
1. Apply at [bridgeinteractive.com](https://bridgeinteractive.com)
2. Set `ZILLOW_API_KEY`, `ZILLOW_DATASET_ID`, and `ZILLOW_API_BASE_URL` in `.env`
3. Set `USE_LIVE_DATA="true"`

### MLS (via Spark API / RESO Web API)
1. Get IDX credentials from your local MLS board
2. Set `MLS_API_URL` and `MLS_API_KEY` in `.env`
3. Set `USE_LIVE_DATA="true"`

Data adapters live in `lib/data-adapters/` and are ready to use once credentials are in place.

---

## Project Structure

```
app/
  page.tsx                  — Home page (listing grid + search)
  listing/[id]/page.tsx     — Listing detail page
  api/
    listings/               — GET listings with filters
    comments/               — GET + POST comments
    comments/[id]/react/    — POST emoji reaction
    contact-agent/          — POST message to agent

components/
  ListingCard.tsx           — Color-blocked listing card
  SearchBar.tsx             — Filter bar
  CommentSection.tsx        — Social comment feed
  AgentContactForm.tsx      — Agent contact card + form

lib/
  prisma.ts                 — Database client
  email.ts                  — Resend email helpers
  data-adapters/
    zillow.ts               — Zillow Bridge API adapter
    mls.ts                  — MLS RESO Web API adapter

prisma/
  schema.prisma             — Database schema
  seed.ts                   — 20 demo listings
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Set your environment variables in the Vercel dashboard. Use a cloud Postgres (Neon or Supabase) for the database URL.
