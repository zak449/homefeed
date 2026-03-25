"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hf_saved_listings";
const COUNT_KEY = "hf_save_count";

function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setSaved(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getSaveCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementSaveCount(): number {
  const next = getSaveCount() + 1;
  localStorage.setItem(COUNT_KEY, String(next));
  return next;
}

export default function SaveButton({ listingId }: { listingId: string }) {
  const [saved, setSavedState] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [totalSaves, setTotalSaves] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setSavedState(getSaved().includes(listingId));
    setTotalSaves(getSaveCount());
  }, [listingId]);

  function toggle() {
    const current = getSaved();
    let next: string[];
    if (current.includes(listingId)) {
      next = current.filter((id) => id !== listingId);
      setSavedState(false);
    } else {
      next = [...current, listingId];
      setSavedState(true);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 400);

      // Increment global save counter
      const newCount = incrementSaveCount();
      setTotalSaves(newCount);

      // After 3rd save, show the subscribe tooltip
      if (newCount === 3) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    }
    setSaved(next);
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
        aria-label={saved ? "Unsave listing" : "Save listing"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={saved ? 0 : 1.5}
          className={`w-5 h-5 ${saved ? "text-red-500" : ""}`}
          style={{
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease",
            transform: animate ? "scale(1.35)" : "scale(1)",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        {saved && <span>Saved</span>}
        {totalSaves > 0 && (
          <span className="text-xs text-muted/50">{totalSaves}</span>
        )}
      </button>

      {/* Subscribe tooltip after 3rd save */}
      {showTooltip && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#F5F5F5] text-[#0E0E0E] text-xs font-medium px-3 py-2 rounded-lg shadow-modal animate-fade-in z-50">
          Want alerts when prices drop? Subscribe!
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-ink rotate-45" />
        </div>
      )}
    </div>
  );
}
