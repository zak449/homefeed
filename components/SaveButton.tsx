"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hf_saved_listings";

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

export default function SaveButton({ listingId }: { listingId: string }) {
  const [saved, setSavedState] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setSavedState(getSaved().includes(listingId));
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
      setTimeout(() => setAnimate(false), 300);
    }
    setSaved(next);
  }

  return (
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
        className={`w-5 h-5 transition-transform ${saved ? "text-red-500" : ""} ${animate ? "scale-125" : "scale-100"}`}
        style={{ transition: "transform 0.2s ease, color 0.2s ease" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {saved && <span>Saved</span>}
    </button>
  );
}
