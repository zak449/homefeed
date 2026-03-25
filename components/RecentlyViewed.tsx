"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

interface RecentlyViewedItem {
  id: string;
  address: string;
  city: string;
  price: number;
  photo: string | null;
  listingType: string;
  timestamp: number;
}

const STORAGE_KEY = "hf_recently_viewed";

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentlyViewedItem[] = JSON.parse(raw);
        // Sort by most recent, max 10
        const sorted = parsed
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
        setItems(sorted);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-bold text-ink">
          Recently Viewed
        </h2>
        <button
          onClick={handleClear}
          className="text-[11px] text-muted hover:text-ink transition-colors font-medium"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => {
          const isRent = item.listingType === "rent";
          const priceLabel = isRent
            ? `$${item.price.toLocaleString()}/mo`
            : `$${item.price.toLocaleString()}`;
          return (
            <Link
              key={item.id}
              href={`/listing/${item.id}`}
              className="flex-shrink-0 w-[140px] bg-[#1A1A1A] border border-border rounded-lg overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-tag">
                {item.photo ? (
                  <FallbackImage
                    src={item.photo}
                    alt={item.address}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/20">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[12px] font-semibold text-ink">{priceLabel}</p>
                <p className="text-[11px] text-muted truncate">{item.address}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
