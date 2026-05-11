/**
 * Typed client-side analytics wrapper around posthog-js.
 *
 * - Respects consent: if the user hasn't granted analytics/personalization
 *   consent (read from session-issued cookie or window.__gwakyConsent),
 *   events are dropped. Consent is re-checked on every event.
 * - No-ops gracefully if posthog isn't initialized or env vars are missing.
 * - Discriminated-union event payloads keep the call sites strongly typed.
 */

import type { PostHog } from "posthog-js";

/* ─────────────────────────────────────────────────────────────────────────
 * Consent
 * ──────────────────────────────────────────────────────────────────────── */

const CONSENT_COOKIE = "gwaky_consent";

export type ConsentSnapshot = {
  analyticsConsent: boolean;
  personalizationConsent: boolean;
  marketingConsent: boolean;
};

declare global {
  interface Window {
    __gwakyConsent?: Partial<ConsentSnapshot>;
  }
}

/**
 * Read consent. Order of precedence:
 *   1. window.__gwakyConsent (set by ConsentBlock / session bootstrap)
 *   2. gwaky_consent cookie (JSON-encoded ConsentSnapshot)
 *   3. Privacy-by-default: everything false.
 */
function readConsent(): ConsentSnapshot {
  if (typeof window === "undefined") {
    return { analyticsConsent: false, personalizationConsent: false, marketingConsent: false };
  }

  const fromWindow = window.__gwakyConsent;
  if (fromWindow) {
    return {
      analyticsConsent: Boolean(fromWindow.analyticsConsent),
      personalizationConsent: Boolean(fromWindow.personalizationConsent),
      marketingConsent: Boolean(fromWindow.marketingConsent),
    };
  }

  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (match) {
      const raw = decodeURIComponent(match.split("=")[1] ?? "");
      const parsed = JSON.parse(raw) as Partial<ConsentSnapshot>;
      return {
        analyticsConsent: Boolean(parsed.analyticsConsent),
        personalizationConsent: Boolean(parsed.personalizationConsent),
        marketingConsent: Boolean(parsed.marketingConsent),
      };
    }
  } catch {
    /* ignore malformed cookie */
  }

  return { analyticsConsent: false, personalizationConsent: false, marketingConsent: false };
}

/** Explicit setter for code paths that hold session-level consent state. */
export function setClientConsent(snapshot: Partial<ConsentSnapshot>): void {
  if (typeof window === "undefined") return;
  window.__gwakyConsent = { ...window.__gwakyConsent, ...snapshot };
}

function consentGranted(): boolean {
  const c = readConsent();
  // Either analytics OR personalization consent unlocks event tracking.
  return c.analyticsConsent || c.personalizationConsent;
}

/* ─────────────────────────────────────────────────────────────────────────
 * PostHog init
 * ──────────────────────────────────────────────────────────────────────── */

let posthogClient: PostHog | null = null;
let initialized = false;

export function initAnalytics(): void {
  if (typeof window === "undefined" || initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) {
    // No key → permanent no-op for this session.
    initialized = true;
    return;
  }

  // Dynamic import keeps posthog-js out of the server bundle and stops
  // SSR from touching window.
  void import("posthog-js").then((mod) => {
    const ph = mod.default;
    ph.init(key, {
      api_host: host || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      // We fire pageviews manually from AnalyticsProvider so we can gate
      // them on consent. Disable PostHog's auto-capture pageview.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
    });
    posthogClient = ph;
    initialized = true;
  });
}

function client(): PostHog | null {
  return posthogClient;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Event taxonomy (discriminated union)
 * ──────────────────────────────────────────────────────────────────────── */

export type AnalyticsEvent =
  | { name: "page_viewed"; props: { path: string } }
  | { name: "listing_viewed"; props: { listingId: string; source?: string } }
  | { name: "comment_posted"; props: { listingId: string; hasMedia: boolean } }
  | { name: "comment_liked"; props: { commentId: string } }
  | { name: "comment_red_flagged"; props: { commentId: string } }
  | { name: "search_performed"; props: { query: string; resultCount: number } }
  | { name: "onboarding_started"; props: Record<string, never> }
  | { name: "onboarding_completed"; props: { tier: 1 | 2 } }
  | { name: "signed_in"; props: { provider: string } }
  | { name: "signed_out"; props: Record<string, never> }
  | { name: "profile_updated"; props: { fields: string[] } }
  | { name: "data_export_requested"; props: Record<string, never> }
  | { name: "consent_changed"; props: { key: string; granted: boolean } };

function capture<E extends AnalyticsEvent>(event: E): void {
  if (typeof window === "undefined") return;
  if (!consentGranted()) return;
  const ph = client();
  if (!ph) return;
  try {
    ph.capture(event.name, event.props as Record<string, unknown>);
  } catch {
    /* swallow — analytics must never break the app */
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Typed event helpers
 * ──────────────────────────────────────────────────────────────────────── */

export const track = {
  pageViewed(path: string) {
    capture({ name: "page_viewed", props: { path } });
  },
  listingViewed(props: { listingId: string; source?: string }) {
    capture({ name: "listing_viewed", props });
  },
  commentPosted(props: { listingId: string; hasMedia: boolean }) {
    capture({ name: "comment_posted", props });
  },
  commentLiked(props: { commentId: string }) {
    capture({ name: "comment_liked", props });
  },
  commentRedFlagged(props: { commentId: string }) {
    capture({ name: "comment_red_flagged", props });
  },
  searchPerformed(props: { query: string; resultCount: number }) {
    capture({ name: "search_performed", props });
  },
  onboardingStarted() {
    capture({ name: "onboarding_started", props: {} });
  },
  onboardingCompleted(props: { tier: 1 | 2 }) {
    capture({ name: "onboarding_completed", props });
  },
  signedIn(props: { provider: string }) {
    capture({ name: "signed_in", props });
  },
  signedOut() {
    capture({ name: "signed_out", props: {} });
  },
  profileUpdated(props: { fields: string[] }) {
    capture({ name: "profile_updated", props });
  },
  dataExportRequested() {
    capture({ name: "data_export_requested", props: {} });
  },
  consentChanged(props: { key: string; granted: boolean }) {
    // Consent changes are themselves a privacy-relevant signal — only
    // record when the user has at least granted personalization/analytics.
    capture({ name: "consent_changed", props });
  },
};

/* ─────────────────────────────────────────────────────────────────────────
 * Identify / reset
 * ──────────────────────────────────────────────────────────────────────── */

export type IdentifyUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  role?: string | null;
};

export function identify(user: IdentifyUser): void {
  if (typeof window === "undefined") return;
  if (!consentGranted()) return;
  const ph = client();
  if (!ph) return;
  try {
    ph.identify(user.id, {
      email: user.email ?? undefined,
      username: user.username ?? undefined,
      role: user.role ?? undefined,
    });
  } catch {
    /* swallow */
  }
}

export function reset(): void {
  if (typeof window === "undefined") return;
  const ph = client();
  if (!ph) return;
  try {
    ph.reset();
  } catch {
    /* swallow */
  }
}
