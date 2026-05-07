"use client";

import { useId } from "react";
import Link from "next/link";
import { COPY } from "@/lib/onboarding/copy";

type Props = {
  tosAccepted: boolean;
  marketingConsent: boolean;
  personalizationConsent: boolean;
  onChange: (
    patch: Partial<{
      tosAccepted: boolean;
      marketingConsent: boolean;
      personalizationConsent: boolean;
    }>
  ) => void;
  errors?: { tosAccepted?: string };
};

/**
 * Granular, separated consent surface.
 *
 * - TOS+Privacy is one required checkbox (legal minimum).
 * - Marketing is opt-in, default OFF.
 * - Personalization is opt-out, default ON, with a one-line plain-English why.
 * - Push is intentionally NOT here — captured at first push-relevant moment.
 */
export function ConsentBlock({
  tosAccepted,
  marketingConsent,
  personalizationConsent,
  onChange,
  errors,
}: Props) {
  const tosId = useId();
  const marketingId = useId();
  const personalizationId = useId();
  const tosErrorId = useId();

  return (
    <fieldset className="of-consent">
      <legend className="of-consent__legend">Your data, your call</legend>

      {/* Required: TOS + Privacy */}
      <label className="of-checkbox" htmlFor={tosId}>
        <input
          id={tosId}
          type="checkbox"
          checked={tosAccepted}
          onChange={(e) => onChange({ tosAccepted: e.target.checked })}
          aria-required="true"
          aria-invalid={Boolean(errors?.tosAccepted)}
          aria-describedby={errors?.tosAccepted ? tosErrorId : undefined}
        />
        <span className="of-checkbox__label">
          I agree to the{" "}
          <Link href="/terms" target="_blank" rel="noopener">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" rel="noopener">Privacy Policy</Link>.
        </span>
      </label>
      {errors?.tosAccepted && (
        <p id={tosErrorId} className="of-error" role="alert">
          {errors.tosAccepted}
        </p>
      )}

      {/* Optional: Marketing — DEFAULT OFF */}
      <label className="of-checkbox" htmlFor={marketingId}>
        <input
          id={marketingId}
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => onChange({ marketingConsent: e.target.checked })}
        />
        <span className="of-checkbox__label">
          {COPY.consent.marketing.label}
          <span className="of-helper of-helper--inline">
            {" "}— {COPY.consent.marketing.why}
          </span>
        </span>
      </label>

      {/* Optional: Personalization — DEFAULT ON */}
      <label className="of-checkbox" htmlFor={personalizationId}>
        <input
          id={personalizationId}
          type="checkbox"
          checked={personalizationConsent}
          onChange={(e) => onChange({ personalizationConsent: e.target.checked })}
        />
        <span className="of-checkbox__label">
          {COPY.consent.personalization.label}
          <span className="of-helper of-helper--inline">
            {" "}— {COPY.consent.personalization.why}
          </span>
        </span>
      </label>

      <p className="of-privacy-default">{COPY.consent.privacyByDefault}</p>
    </fieldset>
  );
}
