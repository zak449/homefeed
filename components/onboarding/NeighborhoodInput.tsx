"use client";

import { useState, useId } from "react";

type Props = {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

/**
 * Free-text neighborhood entry. Press Enter or comma to add a chip.
 * Backspace on empty input removes the last chip.
 */
export function NeighborhoodInput({ values, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState("");
  const inputId = useId();

  function commit() {
    const cleaned = draft.trim().replace(/,$/, "");
    if (!cleaned || values.includes(cleaned)) {
      setDraft("");
      return;
    }
    if (values.length >= 20) {
      setDraft("");
      return;
    }
    onChange([...values, cleaned]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div className="of-typeahead">
      <div className="of-chips" role="list" aria-label="Neighborhoods">
        {values.map((v) => (
          <span key={v} className="of-chip" role="listitem">
            <span>{v}</span>
            <button
              type="button"
              className="of-chip__remove"
              onClick={() => remove(v)}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={inputId}
        type="text"
        className="of-input"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          const next = e.target.value;
          if (next.endsWith(",")) {
            setDraft(next);
            requestAnimationFrame(commit);
          } else {
            setDraft(next);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
            remove(values[values.length - 1]);
          }
        }}
        onBlur={commit}
        aria-label="Add a neighborhood"
      />
    </div>
  );
}
