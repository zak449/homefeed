"use client";

import { useState } from "react";
import { COPY } from "@/lib/onboarding/copy";
import { Tier2Modal } from "./Tier2Modal";
import type { Role } from "@/lib/onboarding/validation";

type Props = {
  /** Server-passed: user's role (drives whether to ask intent/timeline) */
  role: Role | null;
  /** Server-passed: which Tier 2 fields are still empty */
  missingFields: Tier2Field[];
  /** Optional: estimated minutes to finish (default 3) */
  minutes?: number;
};

export type Tier2Field =
  | "intent"
  | "timeline"
  | "budget"
  | "referral"
  | "notifications";

/**
 * Lightweight banner for the home page. Renders only if there are
 * missing Tier 2 fields. Dismiss is per-session (sessionStorage), not
 * persistent — we want it to come back if the user logs out and in,
 * but never within a single session once dismissed.
 */
export function CompleteProfileBanner({ role, missingFields, minutes = 3 }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("of:t2-banner-dismissed") === "1";
  });

  if (dismissed || missingFields.length === 0) return null;

  function dismiss() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("of:t2-banner-dismissed", "1");
    }
    setDismissed(true);
  }

  return (
    <>
      <aside
        className="of-banner"
        role="region"
        aria-label="Complete your profile"
      >
        <div className="of-banner__text">
          <strong className="of-banner__title">{COPY.tier2.bannerTitle}</strong>
          <span className="of-banner__sub">
            About {minutes} min. Better feed. Skippable.
          </span>
        </div>
        <div className="of-banner__actions">
          <button
            type="button"
            className="of-btn of-btn--primary of-btn--sm"
            onClick={() => setOpen(true)}
          >
            {COPY.tier2.bannerCta}
          </button>
          <button
            type="button"
            className="of-btn of-btn--ghost of-btn--sm"
            onClick={dismiss}
          >
            {COPY.tier2.bannerDismiss}
          </button>
        </div>
      </aside>

      {open && (
        <Tier2Modal
          role={role}
          fields={missingFields}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
