"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";

const STORAGE_KEY = "hf_saved_listings";

type Listing = {
  id: string;
  address: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  price: number;
  listingType: string;
  propertyType: string;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  photos: string[];
  agentName?: string | null;
  createdAt?: Date | string;
  _count?: { comments: number };
  topComment?: { name: string; content: string } | null;
};

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      ids = [];
    }
    setSavedIds(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    fetch("/api/listings/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) {
          setListings(data.listings);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  function handleUnsaveAll() {
    localStorage.setItem(STORAGE_KEY, "[]");
    setSavedIds([]);
    setListings([]);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tighter">
              Saved Listings
            </h1>
            {savedIds.length > 0 && (
              <span className="text-xs font-semibold text-muted bg-tag px-2.5 py-1 rounded-full">
                {savedIds.length}
              </span>
            )}
          </div>
          {listings.length > 0 && (
            <button
              onClick={handleUnsaveAll}
              className="text-xs font-medium text-muted hover:text-accent transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-muted mt-1">
          Listings you&apos;ve saved are stored locally in this browser.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="aspect-[4/3] skeleton rounded-xl" />
              <div className="pt-3 space-y-2">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-3 w-40 skeleton rounded" />
                <div className="h-3 w-32 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-8 h-8 text-red-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-ink mb-2">
            You haven&apos;t saved any listings yet
          </p>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Browse and tap the heart to save ones you love. They&apos;ll show up here so you can come back anytime.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-button transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#FF6B2C" }}
          >
            Browse Listings
          </a>
        </div>
      )}

      {/* Listing grid */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Back link */}
      {!loading && listings.length > 0 && (
        <div className="text-center mt-10">
          <a
            href="/"
            className="text-sm font-medium text-social hover:text-social/80 transition-colors"
          >
            &larr; Browse more listings
          </a>
        </div>
      )}
    </div>
  );
}
