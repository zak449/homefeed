"use client";

/**
 * Cookie consent banner. First-visit GDPR/CCPA strip that lets the user
 * accept or reject non-essential cookies (analytics + marketing).
 *
 * Persists the choice in localStorage so we don't nag on subsequent visits.
 * When the user accepts, we also call the existing `recordConsent` server
 * action if they're logged in, so the choice flows through the ConsentLog
 * audit trail. Anonymous users get localStorage-only.
 *
 * Quiet, non-blocking design — sticks to the bottom of the viewport above
 * the mobile tab bar. Does NOT block scrolling or interaction.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "gwaky.cookieConsent.v1";

type ConsentChoice = "accepted" | "rejected" | null;

function readChoice(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
    return null;
  } catch {
    return null;
  }
}

function writeChoice(c: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    if (c) {
      window.localStorage.setItem(STORAGE_KEY, c);
    }
    // Notify the rest of the app so analytics can flip immediately.
    window.dispatchEvent(
      new CustomEvent("gwaky:cookie-consent", { detail: { choice: c } }),
    );
  } catch {
    // localStorage blocked (Safari private mode etc.). Silently swallow —
    // the banner will reappear next mount but everything else still works.
  }
}

export function CookieConsentBanner() {
  // Start hidden to avoid hydration mismatch — flip in useEffect after we
  // check localStorage on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    if (choice === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function onAccept() {
    writeChoice("accepted");
    setVisible(false);
    // Best-effort server-side record. The endpoint is anonymous-tolerant.
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketingConsent: true,
        personalizationConsent: true,
      }),
    }).catch(() => {
      /* swallow — localStorage is source of truth client-side */
    });
  }

  function onReject() {
    writeChoice("rejected");
    setVisible(false);
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketingConsent: false,
        personalizationConsent: false,
      }),
    }).catch(() => {
      /* swallow */
    });
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[80] pb-[max(env(safe-area-inset-bottom),0px)] sm:pb-4"
    >
      {/* Push above the mobile tab bar (which is ~72px tall) on small viewports. */}
      <div className="mx-auto mb-[88px] sm:mb-0 max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-bg/95 backdrop-blur-md shadow-2xl shadow-black/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 text-sm">
              <p
                id="cookie-banner-title"
                className="font-semibold text-ink mb-1"
              >
                We use cookies to make Gwaky work.
              </p>
              <p className="text-secondary leading-snug">
                Essential cookies keep you signed in. Optional ones help us
                see how the site is used so we can make it better. You can
                change your mind any time in{" "}
                <Link
                  href="/profile/edit"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Privacy settings
                </Link>
                . Full details in our{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-amber text-bg text-sm font-semibold hover:bg-amber/90 active:scale-[0.98] transition-transform"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-white/15 text-secondary text-sm font-medium hover:text-ink hover:border-white/25"
              >
                Reject non-essential
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
