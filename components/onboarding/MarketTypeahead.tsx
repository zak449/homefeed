"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchMarkets, type MarketEntry } from "@/lib/onboarding/markets";

type Props = {
  selected: string[]; // market codes
  onChange: (codes: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
};

/**
 * Accessible market typeahead.
 *
 * - WAI-ARIA combobox pattern (1.2): listbox popup, aria-expanded,
 *   aria-controls, aria-activedescendant.
 * - Keyboard: ArrowDown opens, Up/Down navigates, Enter picks,
 *   Esc closes, Backspace on empty input removes the last chip.
 * - 44×44px tap targets on chips and remove buttons (AA touch).
 */
export function MarketTypeahead({
  selected,
  onChange,
  placeholder,
  ariaLabel = "City or metro",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  const candidates: MarketEntry[] = useMemo(
    () => searchMarkets(query, 8).filter((m) => !selected.includes(m.code)),
    [query, selected]
  );

  useEffect(() => {
    if (activeIdx >= candidates.length) setActiveIdx(0);
  }, [candidates.length, activeIdx]);

  function add(code: string) {
    if (selected.includes(code)) return;
    onChange([...selected, code]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(code: string) {
    onChange(selected.filter((c) => c !== code));
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && candidates[activeIdx]) {
        e.preventDefault();
        add(candidates[activeIdx].code);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      remove(selected[selected.length - 1]);
    }
  }

  return (
    <div className="of-typeahead">
      {/* Selected chips */}
      <div className="of-chips" role="list" aria-label="Selected markets">
        {selected.map((code) => {
          const m = searchMarkets(code, 1)[0];
          return (
            <span key={code} className="of-chip" role="listitem">
              <span>{m?.label ?? code}</span>
              <button
                type="button"
                className="of-chip__remove"
                onClick={() => remove(code)}
                aria-label={`Remove ${m?.label ?? code}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* Combobox */}
      <div className="of-combobox" role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={listboxId}
      >
        <input
          ref={inputRef}
          type="text"
          className="of-input"
          value={query}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={open && candidates[activeIdx] ? optionId(activeIdx) : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so option click fires before blur closes the list.
            setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
        />
        {open && candidates.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="of-listbox"
          >
            {candidates.map((m, i) => (
              <li
                id={optionId(i)}
                key={m.code}
                role="option"
                aria-selected={i === activeIdx}
                className={`of-option ${i === activeIdx ? "is-active" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(m.code);
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {m.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
