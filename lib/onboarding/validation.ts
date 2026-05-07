/**
 * Lightweight validators for onboarding form data.
 *
 * Used on both client (immediate inline error) and server (authoritative
 * validation in actions.ts). We deliberately avoid pulling in `zod` to
 * keep the onboarding branch from touching package.json — that file is
 * owned by the auth/comments/notifications task. If `zod` lands as a
 * project-wide dep later, this module can be a one-shot replacement.
 */

export type Role =
  | "RENTER"
  | "BUYER"
  | "SELLER"
  | "AGENT"
  | "BROKER"
  | "INVESTOR"
  | "PROPERTY_MANAGER"
  | "JOURNALIST"
  | "CURIOUS";

export const ROLE_VALUES: readonly Role[] = [
  "RENTER",
  "BUYER",
  "SELLER",
  "AGENT",
  "BROKER",
  "INVESTOR",
  "PROPERTY_MANAGER",
  "JOURNALIST",
  "CURIOUS",
] as const;

// Compatibility shim — the wizard imports `RoleEnum.options` to render
// the role <select>. Mirrors the zod `.options` API minimally.
export const RoleEnum = { options: ROLE_VALUES };

export type BuyRentIntent = "RENTING" | "BUYING" | "SELLING" | "BROWSING";
export const BUY_RENT_INTENT_VALUES: readonly BuyRentIntent[] = [
  "RENTING", "BUYING", "SELLING", "BROWSING",
] as const;

export type IntentTimeline = "WITHIN_30_DAYS" | "WITHIN_6_MONTHS" | "JUST_BROWSING";
export const INTENT_TIMELINE_VALUES: readonly IntentTimeline[] = [
  "WITHIN_30_DAYS", "WITHIN_6_MONTHS", "JUST_BROWSING",
] as const;

export type ReferralSource =
  | "TIKTOK" | "X_TWITTER" | "REDDIT" | "FRIEND" | "ARTICLE" | "SEARCH" | "OTHER";
export const REFERRAL_SOURCE_VALUES: readonly ReferralSource[] = [
  "TIKTOK", "X_TWITTER", "REDDIT", "FRIEND", "ARTICLE", "SEARCH", "OTHER",
] as const;

export type DigestCadence = "OFF" | "DAILY" | "WEEKLY" | "MONTHLY";
export const DIGEST_CADENCE_VALUES: readonly DigestCadence[] = [
  "OFF", "DAILY", "WEEKLY", "MONTHLY",
] as const;

export type ConsentType =
  | "TOS" | "PRIVACY_POLICY" | "MARKETING" | "PERSONALIZATION" | "PUSH" | "DATA_PROCESSING";

// ----- Field validators ---------------------------------------------

export type FieldError = string;

export function validateUsername(v: unknown): FieldError | null {
  if (typeof v !== "string") return "Username is required.";
  if (v.length < 3) return "Username must be at least 3 characters.";
  if (v.length > 20) return "Username must be at most 20 characters.";
  if (!/^[a-z0-9_]+$/.test(v)) return "Lowercase letters, numbers, and underscores only.";
  return null;
}

export function validateDisplayName(v: unknown): FieldError | null {
  if (typeof v !== "string" || v.trim().length === 0) return "Add a name.";
  if (v.length > 60) return "Keep it under 60 characters.";
  return null;
}

function isOneOf<T extends readonly string[]>(values: T, v: unknown): v is T[number] {
  return typeof v === "string" && (values as readonly string[]).includes(v);
}

// ----- Tier 1 input shape & validator -------------------------------

export type Tier1Input = {
  displayName: string;
  username: string;
  role: Role;
  markets: string[];
  neighborhoods: string[];
  tosAccepted: true;
  marketingConsent: boolean;
  personalizationConsent: boolean;
};

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: Array<{ path: (string | number)[]; message: string }> } };

export const tier1Schema = {
  /** Validate a full Tier1Input. */
  safeParse(raw: unknown): ParseResult<Tier1Input> {
    const issues: Array<{ path: (string | number)[]; message: string }> = [];
    const r = (raw ?? {}) as Partial<Tier1Input>;

    const dnErr = validateDisplayName(r.displayName);
    if (dnErr) issues.push({ path: ["displayName"], message: dnErr });

    const unErr = validateUsername(r.username);
    if (unErr) issues.push({ path: ["username"], message: unErr });

    if (!isOneOf(ROLE_VALUES, r.role)) {
      issues.push({ path: ["role"], message: "Pick a role." });
    }

    if (!Array.isArray(r.markets) || r.markets.length === 0) {
      issues.push({ path: ["markets"], message: "Pick at least one city or metro." });
    } else if (r.markets.some((m) => typeof m !== "string" || m.length < 2 || m.length > 8)) {
      issues.push({ path: ["markets"], message: "Invalid market code." });
    }

    if (!Array.isArray(r.neighborhoods)) {
      issues.push({ path: ["neighborhoods"], message: "Invalid neighborhoods." });
    } else if (r.neighborhoods.length > 20) {
      issues.push({ path: ["neighborhoods"], message: "Too many neighborhoods." });
    }

    if (r.tosAccepted !== true) {
      issues.push({ path: ["tosAccepted"], message: "You'll need to agree to the Terms to continue." });
    }

    // marketingConsent / personalizationConsent default to false/true if missing
    const data: Tier1Input = {
      displayName: String(r.displayName ?? ""),
      username: String(r.username ?? ""),
      role: (r.role ?? "RENTER") as Role,
      markets: (r.markets ?? []) as string[],
      neighborhoods: (r.neighborhoods ?? []) as string[],
      tosAccepted: (r.tosAccepted === true) as true,
      marketingConsent: Boolean(r.marketingConsent),
      personalizationConsent: r.personalizationConsent !== false,
    };

    if (issues.length > 0) return { success: false, error: { issues } };
    return { success: true, data };
  },

  /** Pick a subset of keys (mirrors zod's `.pick()` minimally). */
  pick<K extends (keyof Tier1Input)[]>(keys: { [P in K[number]]: true }) {
    return {
      safeParse(raw: unknown): ParseResult<Pick<Tier1Input, K[number]>> {
        const issues: Array<{ path: (string | number)[]; message: string }> = [];
        const r = (raw ?? {}) as Partial<Tier1Input>;
        const out: Partial<Tier1Input> = {};

        if ("displayName" in keys) {
          const e = validateDisplayName(r.displayName);
          if (e) issues.push({ path: ["displayName"], message: e });
          else out.displayName = r.displayName;
        }
        if ("username" in keys) {
          const e = validateUsername(r.username);
          if (e) issues.push({ path: ["username"], message: e });
          else out.username = r.username;
        }
        if ("role" in keys) {
          if (!isOneOf(ROLE_VALUES, r.role)) issues.push({ path: ["role"], message: "Pick a role." });
          else out.role = r.role as Role;
        }
        if ("markets" in keys) {
          if (!Array.isArray(r.markets) || r.markets.length === 0) {
            issues.push({ path: ["markets"], message: "Pick at least one city." });
          } else out.markets = r.markets;
        }
        if ("tosAccepted" in keys) {
          if (r.tosAccepted !== true) issues.push({ path: ["tosAccepted"], message: "You'll need to agree to the Terms to continue." });
          else out.tosAccepted = true as const;
        }

        if (issues.length > 0) return { success: false, error: { issues } };
        return { success: true, data: out as Pick<Tier1Input, K[number]> };
      },
    };
  },
};

// ----- Tier 2 ---------------------------------------------------------

export type Tier2Input = {
  buyRentIntent?: BuyRentIntent;
  intentTimeline?: IntentTimeline;
  budgetBand?: string;
  referralSource?: ReferralSource;
  emailDigestCadence?: DigestCadence;
};

export const tier2Schema = {
  safeParse(raw: unknown): ParseResult<Tier2Input> {
    const issues: Array<{ path: (string | number)[]; message: string }> = [];
    const r = (raw ?? {}) as Tier2Input;
    if (r.buyRentIntent !== undefined && !isOneOf(BUY_RENT_INTENT_VALUES, r.buyRentIntent)) {
      issues.push({ path: ["buyRentIntent"], message: "Invalid choice." });
    }
    if (r.intentTimeline !== undefined && !isOneOf(INTENT_TIMELINE_VALUES, r.intentTimeline)) {
      issues.push({ path: ["intentTimeline"], message: "Invalid choice." });
    }
    if (r.referralSource !== undefined && !isOneOf(REFERRAL_SOURCE_VALUES, r.referralSource)) {
      issues.push({ path: ["referralSource"], message: "Invalid choice." });
    }
    if (r.emailDigestCadence !== undefined && !isOneOf(DIGEST_CADENCE_VALUES, r.emailDigestCadence)) {
      issues.push({ path: ["emailDigestCadence"], message: "Invalid choice." });
    }
    if (r.budgetBand !== undefined && (typeof r.budgetBand !== "string" || r.budgetBand.length > 40)) {
      issues.push({ path: ["budgetBand"], message: "Invalid budget band." });
    }
    if (issues.length > 0) return { success: false, error: { issues } };
    return { success: true, data: r };
  },
  partial() {
    return tier2Schema;
  },
};
