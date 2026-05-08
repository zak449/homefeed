-- Migration: add User onboarding fields + ConsentLog/WatchlistItem/DataExportRequest/AccountDeletionRequest tables
-- Idempotent: every CREATE / ALTER guarded with IF NOT EXISTS or DO ... EXCEPTION blocks.
-- Safe to re-run. Pairs with prisma/schema.prisma additions on feat/onboarding.

-- ─── Enums ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('RENTER','BUYER','SELLER','AGENT','BROKER','INVESTOR','PROPERTY_MANAGER','JOURNALIST','CURIOUS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BuyRentIntent" AS ENUM ('RENTING','BUYING','SELLING','BROWSING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "IntentTimeline" AS ENUM ('WITHIN_30_DAYS','WITHIN_6_MONTHS','JUST_BROWSING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ReferralSource" AS ENUM ('TIKTOK','X_TWITTER','REDDIT','FRIEND','ARTICLE','SEARCH','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DigestCadence" AS ENUM ('OFF','DAILY','WEEKLY','MONTHLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConsentType" AS ENUM ('TOS','PRIVACY_POLICY','MARKETING','PERSONALIZATION','PUSH','DATA_PROCESSING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── User: onboarding & consent columns ────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role"                       "Role";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "markets"                    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "neighborhoods"              TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt"      TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "buyRentIntent"              "BuyRentIntent";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "intentTimeline"             "IntentTimeline";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "budgetBand"                 TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralSource"             "ReferralSource";

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tosAcceptedAt"              TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "privacyPolicyAcceptedAt"    TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingConsent"           BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingConsentAt"         TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalizationConsent"     BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalizationConsentAt"   TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pushConsent"                BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pushConsentAt"              TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dataProcessingConsentedAt"  TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "showRolePublicly"           BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "showMarketsPublicly"        BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "showWatchlistPublicly"      BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailDigestCadence"         "DigestCadence" NOT NULL DEFAULT 'WEEKLY';

-- ─── ConsentLog ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ConsentLog" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "type"      "ConsentType" NOT NULL,
    "value"     BOOLEAN NOT NULL,
    "context"   TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConsentLog_userId_type_createdAt_idx"
  ON "ConsentLog"("userId","type","createdAt");

-- ─── WatchlistItem ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "WatchlistItem" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "buildingId"    TEXT,
    "freeTextLabel" TEXT,
    "isPublic"      BOOLEAN NOT NULL DEFAULT FALSE,
    "note"          TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WatchlistItem_userId_idx"     ON "WatchlistItem"("userId");
CREATE INDEX IF NOT EXISTS "WatchlistItem_buildingId_idx" ON "WatchlistItem"("buildingId");

-- ─── DataExportRequest ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "DataExportRequest" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'PENDING',
    "downloadUrl" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "DataExportRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DataExportRequest_userId_createdAt_idx"
  ON "DataExportRequest"("userId","createdAt");

-- ─── AccountDeletionRequest ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AccountDeletionRequest" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "requestedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "reason"       TEXT,
    "cancelledAt"  TIMESTAMP(3),
    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AccountDeletionRequest_userId_key"
  ON "AccountDeletionRequest"("userId");
CREATE INDEX IF NOT EXISTS "AccountDeletionRequest_scheduledFor_idx"
  ON "AccountDeletionRequest"("scheduledFor");

-- ─── Foreign keys (guarded) ────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "ConsentLog"
    ADD CONSTRAINT "ConsentLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WatchlistItem"
    ADD CONSTRAINT "WatchlistItem_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DataExportRequest"
    ADD CONSTRAINT "DataExportRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AccountDeletionRequest"
    ADD CONSTRAINT "AccountDeletionRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
