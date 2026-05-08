"use client";

import { useState, useTransition, useId, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COPY } from "@/lib/onboarding/copy";
import { tier1Schema, type Tier1Input, RoleEnum } from "@/lib/onboarding/validation";
import { submitOnboarding } from "@/lib/onboarding/actions";
import { MarketTypeahead } from "./MarketTypeahead";
import { NeighborhoodInput } from "./NeighborhoodInput";
import { ConsentBlock } from "./ConsentBlock";

type Step = 1 | 2;

type Props = {
  initial?: {
    displayName?: string;
    username?: string;
  };
};

const ROLES = RoleEnum.options;

export function OnboardingWizard({ initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<Tier1Input>({
    displayName: initial?.displayName ?? "",
    username: initial?.username ?? "",
    role: "RENTER",
    markets: [],
    neighborhoods: [],
    tosAccepted: false as unknown as true, // typed as literal(true) on submit
    marketingConsent: false,
    personalizationConsent: true,
  });

  const titleRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading on step change for screen readers.
  useEffect(() => {
    titleRef.current?.focus();
  }, [step]);

  function patch(p: Partial<Tier1Input>) {
    setForm((f) => ({ ...f, ...p }));
    setFieldErrors((errs) => {
      const next = { ...errs };
      for (const k of Object.keys(p)) delete next[k];
      return next;
    });
  }

  function validateStep1(): boolean {
    const partial = tier1Schema.pick({
      displayName: true,
      username: true,
      role: true,
    }).safeParse(form);
    if (partial.success) return true;
    const fe: Record<string, string> = {};
    for (const issue of partial.error.issues) {
      const k = issue.path[0]?.toString() ?? "_form";
      if (!fe[k]) fe[k] = issue.message;
    }
    setFieldErrors(fe);
    return false;
  }

  function onContinue() {
    if (validateStep1()) setStep(2);
  }

  function onSubmit() {
    setServerError(null);
    setFieldErrors({});
    const parsed = tier1Schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString() ?? "_form";
        if (!fe[k]) fe[k] = issue.message;
      }
      setFieldErrors(fe);
      // If there's a step-1 error, jump back.
      if (fe.displayName || fe.username || fe.role) setStep(1);
      return;
    }
    startTransition(async () => {
      const res = await submitOnboarding(parsed.data);
      if (res.ok) {
        router.push(res.data?.redirectTo ?? "/");
      } else {
        setServerError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.fieldErrors?.username || res.fieldErrors?.displayName) setStep(1);
      }
    });
  }

  function onSkip() {
    // Skip-to-app: write minimal data so the user isn't stuck. Markets
    // empty means the home page will surface the Tier 2 carrot.
    if (!validateStep1()) return;
    startTransition(async () => {
      const res = await submitOnboarding({
        ...form,
        markets: form.markets.length ? form.markets : ["nyc"], // sensible default
        tosAccepted: true as const,
      });
      if (res.ok) {
        router.push(res.data?.redirectTo ?? "/?skipped=1");
      } else {
        setServerError(res.error);
        if (res.fieldErrors?.tosAccepted) setStep(2);
      }
    });
  }

  return (
    <div className="of-wizard">
      <ProgressDots step={step} />
      {step === 1 ? (
        <Step1
          titleRef={titleRef}
          form={form}
          patch={patch}
          fieldErrors={fieldErrors}
          onContinue={onContinue}
        />
      ) : (
        <Step2
          titleRef={titleRef}
          form={form}
          patch={patch}
          fieldErrors={fieldErrors}
          serverError={serverError}
          pending={pending}
          onBack={() => setStep(1)}
          onSubmit={onSubmit}
          onSkip={onSkip}
        />
      )}
    </div>
  );
}

function ProgressDots({ step }: { step: Step }) {
  return (
    <div className="of-dots" aria-hidden>
      <span className={`of-dot ${step >= 1 ? "is-active" : ""}`} />
      <span className={`of-dot ${step >= 2 ? "is-active" : ""}`} />
    </div>
  );
}

function Step1({
  titleRef,
  form,
  patch,
  fieldErrors,
  onContinue,
}: {
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  form: Tier1Input;
  patch: (p: Partial<Tier1Input>) => void;
  fieldErrors: Record<string, string>;
  onContinue: () => void;
}) {
  const c = COPY.wizard.screen1;
  const dnId = useId();
  const unId = useId();
  const roleId = useId();

  return (
    <form
      className="of-step"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
      noValidate
    >
      <h1 ref={titleRef as React.RefObject<HTMLHeadingElement>} tabIndex={-1} className="of-title">{c.title}</h1>
      <p className="of-subtitle">{c.subtitle}</p>

      {/* Display name */}
      <div className="of-field">
        <label htmlFor={dnId} className="of-label">{c.displayName.label}</label>
        <p className="of-helper">{c.displayName.helper}</p>
        <input
          id={dnId}
          className="of-input"
          type="text"
          value={form.displayName}
          onChange={(e) => patch({ displayName: e.target.value })}
          placeholder={c.displayName.placeholder}
          autoComplete="name"
          autoFocus
          aria-invalid={Boolean(fieldErrors.displayName)}
          aria-describedby={fieldErrors.displayName ? `${dnId}-err` : undefined}
        />
        {fieldErrors.displayName && (
          <p id={`${dnId}-err`} className="of-error" role="alert">
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      {/* Username */}
      <div className="of-field">
        <label htmlFor={unId} className="of-label">{c.username.label}</label>
        <p className="of-helper">{c.username.helper}</p>
        <div className="of-input-prefix">
          <span className="of-input-prefix__text">{c.username.prefix}</span>
          <input
            id={unId}
            className="of-input of-input--prefixed"
            type="text"
            value={form.username}
            onChange={(e) => patch({ username: e.target.value.toLowerCase() })}
            placeholder={c.username.placeholder}
            autoComplete="username"
            inputMode="text"
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? `${unId}-err` : undefined}
          />
        </div>
        {fieldErrors.username && (
          <p id={`${unId}-err`} className="of-error" role="alert">
            {fieldErrors.username}
          </p>
        )}
      </div>

      {/* Role */}
      <div className="of-field">
        <label htmlFor={roleId} className="of-label">{c.role.label}</label>
        <p className="of-helper">{c.role.helper}</p>
        <select
          id={roleId}
          className="of-input"
          value={form.role}
          onChange={(e) => patch({ role: e.target.value as Tier1Input["role"] })}
          aria-invalid={Boolean(fieldErrors.role)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {(c.role.options as Record<string, string>)[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="of-actions">
        <button type="submit" className="of-btn of-btn--primary">
          {c.cta}
        </button>
      </div>
    </form>
  );
}

function Step2({
  titleRef,
  form,
  patch,
  fieldErrors,
  serverError,
  pending,
  onBack,
  onSubmit,
  onSkip,
}: {
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  form: Tier1Input;
  patch: (p: Partial<Tier1Input>) => void;
  fieldErrors: Record<string, string>;
  serverError: string | null;
  pending: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const c = COPY.wizard.screen2;

  return (
    <form
      className="of-step"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <button type="button" className="of-back" onClick={onBack} aria-label="Back to step 1">
        ← Back
      </button>

      <h1 ref={titleRef as React.RefObject<HTMLHeadingElement>} tabIndex={-1} className="of-title">{c.title}</h1>
      <p className="of-subtitle">{c.subtitle}</p>

      <div className="of-field">
        <label className="of-label">{c.markets.label}</label>
        <p className="of-helper">{c.markets.helper}</p>
        <MarketTypeahead
          selected={form.markets}
          onChange={(markets) => patch({ markets })}
          placeholder={c.markets.placeholder}
          ariaLabel={c.markets.label}
        />
        {fieldErrors.markets && (
          <p className="of-error" role="alert">{fieldErrors.markets}</p>
        )}
      </div>

      <div className="of-field">
        <label className="of-label">{c.neighborhoods.label}</label>
        <p className="of-helper">{c.neighborhoods.helper}</p>
        <NeighborhoodInput
          values={form.neighborhoods}
          onChange={(neighborhoods) => patch({ neighborhoods })}
          placeholder={c.neighborhoods.placeholder}
        />
      </div>

      <ConsentBlock
        tosAccepted={Boolean(form.tosAccepted)}
        marketingConsent={form.marketingConsent}
        personalizationConsent={form.personalizationConsent}
        onChange={(p) => patch(p as Partial<Tier1Input>)}
        errors={{ tosAccepted: fieldErrors.tosAccepted }}
      />

      {serverError && (
        <p className="of-error of-error--server" role="alert">{serverError}</p>
      )}

      <div className="of-actions">
        <button
          type="submit"
          className="of-btn of-btn--primary"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "…" : c.cta}
        </button>
        <button
          type="button"
          className="of-btn of-btn--ghost"
          onClick={onSkip}
          disabled={pending}
        >
          {c.skip}
        </button>
      </div>
    </form>
  );
}
