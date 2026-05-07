"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { COPY } from "@/lib/onboarding/copy";
import { saveTier2Field } from "@/lib/onboarding/actions";
import type { Tier2Input, Role } from "@/lib/onboarding/validation";
import type { Tier2Field } from "./CompleteProfileBanner";

type Props = {
  role: Role | null;
  fields: Tier2Field[];
  onClose: () => void;
};

const BUDGET_BANDS_RENT = [
  { code: "rent_lt_1500", label: "Under $1,500" },
  { code: "rent_1500_2000", label: "$1,500 – 2,000" },
  { code: "rent_2000_3000", label: "$2,000 – 3,000" },
  { code: "rent_3000_5000", label: "$3,000 – 5,000" },
  { code: "rent_5000_plus", label: "$5,000+" },
];

const BUDGET_BANDS_BUY = [
  { code: "buy_lt_300k", label: "Under $300k" },
  { code: "buy_300_500k", label: "$300k – 500k" },
  { code: "buy_500_750k", label: "$500k – 750k" },
  { code: "buy_750_1m", label: "$750k – 1M" },
  { code: "buy_1m_2m", label: "$1M – 2M" },
  { code: "buy_2m_plus", label: "$2M+" },
];

/**
 * Progressive disclosure modal. One question at a time, progress dots,
 * skip-per-question. Skip writes nothing for that field; Done writes the
 * accumulated answers in a single server action call at the end.
 */
export function Tier2Modal({ role, fields, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Tier2Input>>({});
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Filter out conditional fields based on role.
  const isShopper = role === "RENTER" || role === "BUYER";
  const visibleFields = fields.filter((f) => {
    if (f === "intent" && !isShopper) return false;
    if (f === "timeline" && !isShopper) return false;
    if (f === "budget" && !isShopper) return false;
    return true;
  });

  // Move focus to the dialog on open + on every step change.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (visibleFields.length === 0) {
    onClose();
    return null;
  }

  const currentField = visibleFields[step];
  const isLast = step === visibleFields.length - 1;

  function next() {
    if (isLast) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  }

  function finish() {
    startTransition(async () => {
      await saveTier2Field(answers);
      onClose();
    });
  }

  return (
    <div
      className="of-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="of-tier2-heading"
        className="of-modal"
      >
        <button
          type="button"
          className="of-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <ProgressDotsN current={step} total={visibleFields.length} />

        <div className="of-modal__body">
          {currentField === "intent" && (
            <Question
              headingRef={headingRef}
              title={COPY.tier2.intent.title}
              helper={COPY.tier2.intent.helper}
              options={Object.entries(COPY.tier2.intent.options)}
              selected={answers.buyRentIntent}
              onSelect={(v) => setAnswers((a) => ({ ...a, buyRentIntent: v as Tier2Input["buyRentIntent"] }))}
            />
          )}
          {currentField === "timeline" && (
            <Question
              headingRef={headingRef}
              title={COPY.tier2.timeline.title}
              helper={COPY.tier2.timeline.helper}
              options={Object.entries(COPY.tier2.timeline.options)}
              selected={answers.intentTimeline}
              onSelect={(v) => setAnswers((a) => ({ ...a, intentTimeline: v as Tier2Input["intentTimeline"] }))}
            />
          )}
          {currentField === "budget" && (
            <Question
              headingRef={headingRef}
              title={COPY.tier2.budget.title}
              helper={`${COPY.tier2.budget.helper} ${COPY.tier2.budget.private}`}
              options={(answers.buyRentIntent === "BUYING" ? BUDGET_BANDS_BUY : BUDGET_BANDS_RENT).map((b) => [b.code, b.label] as const)}
              selected={answers.budgetBand}
              onSelect={(v) => setAnswers((a) => ({ ...a, budgetBand: v }))}
            />
          )}
          {currentField === "referral" && (
            <Question
              headingRef={headingRef}
              title={COPY.tier2.referral.title}
              helper={COPY.tier2.referral.helper}
              options={Object.entries(COPY.tier2.referral.options)}
              selected={answers.referralSource}
              onSelect={(v) => setAnswers((a) => ({ ...a, referralSource: v as Tier2Input["referralSource"] }))}
            />
          )}
          {currentField === "notifications" && (
            <Question
              headingRef={headingRef}
              title={COPY.tier2.notifications.title}
              options={Object.entries(COPY.tier2.notifications.options)}
              selected={answers.emailDigestCadence}
              onSelect={(v) => setAnswers((a) => ({ ...a, emailDigestCadence: v as Tier2Input["emailDigestCadence"] }))}
            />
          )}
        </div>

        <div className="of-modal__actions">
          <button
            type="button"
            className="of-btn of-btn--ghost"
            onClick={next}
            disabled={pending}
          >
            {COPY.tier2.skip}
          </button>
          <button
            type="button"
            className="of-btn of-btn--primary"
            onClick={next}
            disabled={pending}
            aria-busy={pending}
          >
            {isLast ? COPY.tier2.finish : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressDotsN({ current, total }: { current: number; total: number }) {
  return (
    <div className="of-dots" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`of-dot ${i <= current ? "is-active" : ""}`} />
      ))}
    </div>
  );
}

function Question({
  headingRef,
  title,
  helper,
  options,
  selected,
  onSelect,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  title: string;
  helper?: string;
  options: ReadonlyArray<readonly [string, string] | [string, string]>;
  selected?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="of-question">
      <h2
        id="of-tier2-heading"
        ref={headingRef}
        tabIndex={-1}
        className="of-modal__title"
      >
        {title}
      </h2>
      {helper && <p className="of-helper">{helper}</p>}
      <div className="of-radio-group" role="radiogroup" aria-label={title}>
        {options.map(([value, label]) => (
          <label
            key={value}
            className={`of-radio ${selected === value ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="of-tier2"
              value={value}
              checked={selected === value}
              onChange={() => onSelect(value)}
            />
            <span className="of-radio__label">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
