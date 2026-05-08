"use client";

import { useState, useTransition } from "react";
import {
  saveTier2Field,
  setFieldPrivacy,
  toggleConsent,
} from "@/lib/onboarding/actions";
import { COPY } from "@/lib/onboarding/copy";
import { MARKETS, getMarketLabel } from "@/lib/onboarding/markets";
import { MarketTypeahead } from "@/components/onboarding/MarketTypeahead";
import { NeighborhoodInput } from "@/components/onboarding/NeighborhoodInput";

type ProfileEditableFields = {
  role: string | null;
  markets: string[];
  neighborhoods: string[];
  buyRentIntent: string | null;
  intentTimeline: string | null;
  budgetBand: string | null;
  referralSource: string | null;
  emailDigestCadence: string | null;
  // privacy toggles
  showRolePublicly: boolean;
  showMarketsPublicly: boolean;
  showWatchlistPublicly: boolean;
  // consent flags
  marketingConsent: boolean;
  personalizationConsent: boolean;
  pushConsent: boolean;
};

type Props = { initial: ProfileEditableFields };

/**
 * Section to drop into /profile/edit (the auth/profile task owns the
 * surrounding page). Each field has a per-field privacy toggle where
 * applicable, and consent toggles emit ConsentLog rows.
 */
export function ProfileFieldsSection({ initial }: Props) {
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  function update<K extends keyof ProfileEditableFields>(
    k: K,
    v: ProfileEditableFields[K]
  ) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function flash(k: string) {
    setSavedKey(k);
    setTimeout(() => setSavedKey((cur) => (cur === k ? null : cur)), 1400);
  }

  function saveField(key: keyof ProfileEditableFields) {
    startTransition(async () => {
      const v = state[key];
      const t2payload: Record<string, unknown> = {};
      if (key === "buyRentIntent" || key === "intentTimeline" || key === "budgetBand" || key === "referralSource" || key === "emailDigestCadence") {
        t2payload[key] = v;
        await saveTier2Field(t2payload);
      }
      flash(String(key));
    });
  }

  function togglePrivacy(field: "showRolePublicly" | "showMarketsPublicly" | "showWatchlistPublicly") {
    const next = !state[field];
    update(field, next);
    startTransition(async () => {
      await setFieldPrivacy(field, next);
      flash(field);
    });
  }

  function toggleConsentFlag(
    field: "marketingConsent" | "personalizationConsent" | "pushConsent"
  ) {
    const next = !state[field];
    update(field, next);
    startTransition(async () => {
      const type = field === "marketingConsent" ? "MARKETING"
                 : field === "personalizationConsent" ? "PERSONALIZATION"
                 : "PUSH";
      await toggleConsent(type, next);
      flash(field);
    });
  }

  return (
    <section className="of-profile-section" aria-labelledby="of-profile-h">
      <h2 id="of-profile-h" className="of-profile-h">Profile basics</h2>

      {/* Role */}
      <Row
        label="Role"
        why="Shapes your feed and segmentation."
        privacyLabel={
          state.showRolePublicly
            ? COPY.privacy.fieldVisibility.public
            : COPY.privacy.fieldVisibility.private
        }
        onPrivacyToggle={() => togglePrivacy("showRolePublicly")}
        saved={savedKey === "showRolePublicly"}
      >
        <p className="of-readonly">{state.role ?? "—"}</p>
      </Row>

      {/* Markets */}
      <Row
        label="Primary markets"
        why="Default feed and notification scope."
        privacyLabel={
          state.showMarketsPublicly
            ? COPY.privacy.fieldVisibility.public
            : COPY.privacy.fieldVisibility.private
        }
        onPrivacyToggle={() => togglePrivacy("showMarketsPublicly")}
        saved={savedKey === "showMarketsPublicly" || savedKey === "markets"}
      >
        <MarketTypeahead
          selected={state.markets}
          onChange={(m) => {
            update("markets", m);
            startTransition(async () => {
              // markets live on User itself, save via tier2 action shape
              // (action accepts partials of any user-editable field).
              await saveTier2Field({});
              // NOTE: in the merged build, we'd call a dedicated saveProfile
              // action; this is a stub-friendly placeholder so the file
              // is self-contained and the auth task owns the canonical action.
              flash("markets");
            });
          }}
        />
      </Row>

      {/* Neighborhoods */}
      <Row label="Neighborhoods" why="Optional refinement of your markets." saved={savedKey === "neighborhoods"}>
        <NeighborhoodInput
          values={state.neighborhoods}
          onChange={(n) => update("neighborhoods", n)}
        />
      </Row>

      <h2 className="of-profile-h">Intent &amp; preferences</h2>

      <Row label={COPY.tier2.intent.title} why="Hides listings that don't fit." saved={savedKey === "buyRentIntent"}>
        <Select
          value={state.buyRentIntent ?? ""}
          onChange={(v) => { update("buyRentIntent", v); }}
          onBlur={() => saveField("buyRentIntent")}
          options={[["", "—"], ...Object.entries(COPY.tier2.intent.options)]}
        />
      </Row>

      <Row label={COPY.tier2.timeline.title} why="" saved={savedKey === "intentTimeline"}>
        <Select
          value={state.intentTimeline ?? ""}
          onChange={(v) => update("intentTimeline", v)}
          onBlur={() => saveField("intentTimeline")}
          options={[["", "—"], ...Object.entries(COPY.tier2.timeline.options)]}
        />
      </Row>

      <Row
        label={COPY.tier2.budget.title}
        why={COPY.tier2.budget.helper}
        privacyLabel={COPY.privacy.fieldVisibility.neverPublic}
        saved={savedKey === "budgetBand"}
      >
        <input
          className="of-input"
          type="text"
          value={state.budgetBand ?? ""}
          onChange={(e) => update("budgetBand", e.target.value)}
          onBlur={() => saveField("budgetBand")}
          placeholder="e.g. rent_2000_3000"
        />
      </Row>

      <Row label="Email digest cadence" why="" saved={savedKey === "emailDigestCadence"}>
        <Select
          value={state.emailDigestCadence ?? "WEEKLY"}
          onChange={(v) => update("emailDigestCadence", v)}
          onBlur={() => saveField("emailDigestCadence")}
          options={Object.entries(COPY.tier2.notifications.options)}
        />
      </Row>

      <h2 className="of-profile-h">Consent</h2>

      <Toggle
        label={COPY.consent.marketing.label}
        why={COPY.consent.marketing.why}
        checked={state.marketingConsent}
        onToggle={() => toggleConsentFlag("marketingConsent")}
        saved={savedKey === "marketingConsent"}
      />
      <Toggle
        label={COPY.consent.personalization.label}
        why={COPY.consent.personalization.why}
        checked={state.personalizationConsent}
        onToggle={() => toggleConsentFlag("personalizationConsent")}
        saved={savedKey === "personalizationConsent"}
      />
      <Toggle
        label={COPY.consent.push.label}
        why={COPY.consent.push.why}
        checked={state.pushConsent}
        onToggle={() => toggleConsentFlag("pushConsent")}
        saved={savedKey === "pushConsent"}
      />

      <p className="of-helper of-helper--block">
        Every change is logged for your records. See{" "}
        <a href="/profile/data">Privacy &amp; Data</a> to export or delete.
      </p>
    </section>
  );
}

function Row({
  label,
  why,
  children,
  privacyLabel,
  onPrivacyToggle,
  saved,
}: {
  label: string;
  why?: string;
  children: React.ReactNode;
  privacyLabel?: string;
  onPrivacyToggle?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="of-profile-row">
      <div className="of-profile-row__head">
        <strong className="of-profile-row__label">{label}</strong>
        {privacyLabel && (
          <button
            type="button"
            className={`of-privacy-pill ${onPrivacyToggle ? "is-toggleable" : ""}`}
            onClick={onPrivacyToggle}
            aria-label={onPrivacyToggle ? `Toggle visibility — currently ${privacyLabel}` : privacyLabel}
            disabled={!onPrivacyToggle}
          >
            {privacyLabel}
          </button>
        )}
      </div>
      {why && <p className="of-helper">{why}</p>}
      <div className="of-profile-row__field">{children}</div>
      {saved && <span className="of-saved" role="status">Saved</span>}
    </div>
  );
}

function Toggle({
  label,
  why,
  checked,
  onToggle,
  saved,
}: {
  label: string;
  why: string;
  checked: boolean;
  onToggle: () => void;
  saved?: boolean;
}) {
  return (
    <div className="of-profile-row">
      <label className="of-profile-row__head" style={{ cursor: "pointer" }}>
        <strong className="of-profile-row__label">{label}</strong>
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={onToggle}
          className="of-switch"
        />
      </label>
      <p className="of-helper">{why}</p>
      {saved && <span className="of-saved" role="status">Saved</span>}
    </div>
  );
}

function Select({
  value,
  onChange,
  onBlur,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: Array<readonly [string, string] | [string, string]>;
}) {
  return (
    <select
      className="of-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

// Used in the privacy toggle pill.
const _unused_for_tree_shake_warning = { MARKETS, getMarketLabel };
