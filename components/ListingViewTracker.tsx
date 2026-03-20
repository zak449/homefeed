"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

const STORAGE_KEY = "hf_recently_viewed";
const MAX_ENTRIES = 20;

interface RecentlyViewedEntry {
  id: string;
  address: string;
  city: string;
  price: number;
  photo: string | null;
  listingType: string;
  timestamp: number;
}

interface ListingViewTrackerProps {
  listingId: string;
  city: string;
  address: string;
  price: number;
  photo: string | null;
  listingType: string;
}

export default function ListingViewTracker({
  listingId,
  city,
  address,
  price,
  photo,
  listingType,
}: ListingViewTrackerProps) {
  useEffect(() => {
    trackEvent("listing_view", { listingId, city });

    // Save to localStorage for recently viewed
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: RecentlyViewedEntry[] = raw ? JSON.parse(raw) : [];

      // Remove duplicate if exists
      const filtered = existing.filter((entry) => entry.id !== listingId);

      // Add new entry at the front (most recent first)
      const newEntry: RecentlyViewedEntry = {
        id: listingId,
        address,
        city,
        price,
        photo,
        listingType,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore localStorage errors (e.g. private browsing)
    }
  }, [listingId, city, address, price, photo, listingType]);

  return null;
}
