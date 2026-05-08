"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";
import NextUpCta from "@/components/NextUpCta";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-glow flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Your watchlist
              </h1>
            </div>
            {savedIds.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 text-xs font-bold text-amber bg-glow px-2 rounded-full">
                {savedIds.length}
              </span>
            )}
          </div>
          {listings.length > 0 && (
            <button
              onClick={handleUnsaveAll}
              className="text-xs font-semibold text-muted hover:text-amber transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-secondary mt-2 ml-[52px]">
          Saved spots — heated by takes from neighbors, past renters, and almost-buyers.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] skeleton rounded-2xl" />
              <div className="pt-3.5 space-y-2.5">
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
        <div className="flex flex-col items-center justify-center py-20 sm:py-28">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber/[0.06] blur-2xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-glow flex items-center justify-center shadow-glow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF2E93"
                strokeWidth={1.5}
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
          </div>

          {/* Copy */}
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight mb-2 text-center">
            Watchlist is empty
          </h2>
          <p className="text-sm sm:text-base text-secondary max-w-md mx-auto text-center leading-relaxed mb-8">
            Heart any listing to add it here. We&apos;ll heat it up for you — Tea Temp moves whenever neighbors drop new takes on places you&apos;re watching.
          </p>

          {/* Two-up next-step grid — every dead end is now two doors */}
          <div className="w-full max-w-md grid sm:grid-cols-2 gap-3">
            <NextUpCta href="/" emoji="🔍" eyebrow="Find your block">
              Browse listings
            </NextUpCta>
            <NextUpCta href="/hot-takes" emoji="🔥" eyebrow="What's boiling">
              Today&apos;s hot takes
            </NextUpCta>
          </div>

          {/* Subtle hint */}
          <p className="text-xs text-tertiary mt-6">
            Saved listings stay in this browser only — heart one to start the watchlist.
          </p>
        </div>
      )}

      {/* Listing grid */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Next up — every page ends with traction, never a footer */}
      {!loading && listings.length > 0 && (
        <div className="mt-12 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          <NextUpCta href="/hot-takes" emoji="🔥" eyebrow="Heat check">
            See what&apos;s boiling today
          </NextUpCta>
          <NextUpCta href="/" emoji="🔍" eyebrow="Add to watchlist">
            Browse more listings
          </NextUpCta>
        </div>
      )}
    </div>
  );
}
