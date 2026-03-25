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
  const [showSaveAuth, setShowSaveAuth] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    setSavedState(getSaved().includes(listingId));
    setTotalSaves(getSaveCount());
  }, [listingId]);

  function toggleSave() {
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

  function handleSave() {
    try {
      const commenter = localStorage.getItem("hf_commenter");
      if (!commenter || !JSON.parse(commenter).email) {
        setShowSaveAuth(true);
        return;
      }
    } catch {}
    toggleSave();
  }

  return (
    <div className="relative">
      <button
        onClick={handleSave}
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
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-bg text-xs font-medium px-3 py-2 rounded-lg shadow-modal animate-fade-in z-50">
          Want alerts when prices drop? Subscribe!
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-ink rotate-45" />
        </div>
      )}

      {/* Email capture gate for saving */}
      {showSaveAuth && (
        <div className="absolute top-full left-0 z-50 mt-2 bg-surface border border-accent/30 rounded-xl p-4 space-y-2 animate-in fade-in w-72 shadow-xl">
          <p className="text-white text-sm font-semibold">Save across all your devices</p>
          <p className="text-secondary text-xs">Drop your email to sync saves, takes & notifications.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Name" value={saveName} onChange={e => setSaveName(e.target.value)} className="flex-1 rounded-lg bg-bg border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50" required />
            <input type="email" placeholder="Email" value={saveEmail} onChange={e => setSaveEmail(e.target.value)} className="flex-1 rounded-lg bg-bg border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50" required />
          </div>
          <button
            onClick={() => {
              if (!saveName.trim() || !saveEmail.trim()) return;
              localStorage.setItem("hf_commenter", JSON.stringify({ name: saveName, email: saveEmail }));
              fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: saveEmail, source: "save-gate", name: saveName }) }).catch(() => {});
              setShowSaveAuth(false);
              toggleSave();
            }}
            disabled={!saveName.trim() || !saveEmail.trim()}
            className="w-full py-2 bg-accent text-white text-sm font-bold rounded-lg active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Save & sync →
          </button>
        </div>
      )}
    </div>
  );
}
