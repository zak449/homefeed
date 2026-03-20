"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "hf_saved_searches";
const MAX_SAVED = 5;

export type SavedSearch = {
  id: string;
  city: string;
  type: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  maxSqft: string;
  label: string;
  savedAt: string;
};

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function removeSavedSearch(id: string) {
  const searches = getSavedSearches().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

function buildLabel(params: {
  city: string;
  type: string;
  propertyType: string;
  minBeds: string;
}): string {
  const parts: string[] = [];
  if (params.city) parts.push(params.city);
  if (params.type) parts.push(params.type === "rent" ? "Rent" : "Sale");
  if (params.propertyType) parts.push(params.propertyType);
  if (params.minBeds) parts.push(`${params.minBeds}+ bd`);
  return parts.length > 0 ? parts.join(" · ") : "All listings";
}

interface SaveSearchButtonProps {
  city: string;
  type: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  maxSqft: string;
}

export default function SaveSearchButton({
  city,
  type,
  propertyType,
  minPrice,
  maxPrice,
  minBeds,
  minBaths,
  minSqft,
  maxSqft,
}: SaveSearchButtonProps) {
  const [toast, setToast] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Check if current search params match any saved search
  useEffect(() => {
    const saved = getSavedSearches();
    const match = saved.some(
      (s) =>
        s.city === city &&
        s.type === type &&
        s.propertyType === propertyType &&
        s.minPrice === minPrice &&
        s.maxPrice === maxPrice &&
        s.minBeds === minBeds &&
        s.minBaths === minBaths &&
        s.minSqft === minSqft &&
        s.maxSqft === maxSqft
    );
    setIsSaved(match);
  }, [city, type, propertyType, minPrice, maxPrice, minBeds, minBaths, minSqft, maxSqft]);

  function handleSave() {
    const saved = getSavedSearches();

    // Already saved?
    const alreadyExists = saved.some(
      (s) =>
        s.city === city &&
        s.type === type &&
        s.propertyType === propertyType &&
        s.minPrice === minPrice &&
        s.maxPrice === maxPrice &&
        s.minBeds === minBeds &&
        s.minBaths === minBaths &&
        s.minSqft === minSqft &&
        s.maxSqft === maxSqft
    );

    if (alreadyExists) {
      setToast("Already saved!");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    if (saved.length >= MAX_SAVED) {
      setToast(`Max ${MAX_SAVED} saved searches. Remove one first.`);
      setTimeout(() => setToast(""), 2500);
      return;
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(36),
      city,
      type,
      propertyType,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      minSqft,
      maxSqft,
      label: buildLabel({ city, type, propertyType, minBeds }),
      savedAt: new Date().toISOString(),
    };

    saved.unshift(newSearch);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setIsSaved(true);
    setToast("Search saved! We'll keep you posted.");
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSave}
        className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
          isSaved
            ? "border-amber-300 text-amber-700 bg-amber-50"
            : "border-border text-muted hover:text-ink hover:border-ink/30"
        }`}
        title="Save this search"
      >
        <span className="text-base leading-none">{isSaved ? "🔔" : "🔔"}</span>
        <span className="hidden sm:inline text-xs">{isSaved ? "Saved" : "Save"}</span>
      </button>

      {/* Toast */}
      {toast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-modal animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
