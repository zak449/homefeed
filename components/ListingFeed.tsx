"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ListingCard from "@/components/ListingCard";

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
  latitude?: number | null;
  longitude?: number | null;
  _count?: { comments: number };
  topComment?: { name: string; content: string } | null;
};

type Props = {
  initialListings: Listing[];
  initialHasMore: boolean;
  searchParams: Record<string, string>;
};

export default function ListingFeed({
  initialListings,
  initialHasMore,
  searchParams,
}: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when search params change (server provides new initial data)
  useEffect(() => {
    setListings(initialListings);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialListings, initialHasMore]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));

    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings((prev) => [...prev, ...data.listings]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch {
      // Silently fail — user can scroll again to retry
    }

    setLoading(false);
  }, [loading, hasMore, page, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  // Count how many listings have comments
  const withCommentsCount = listings.filter(l => (l._count?.comments ?? 0) > 0).length;

  return (
    <>
      {/* Social activity summary bar */}
      {withCommentsCount > 0 && (
        <div className="flex items-center gap-2 mt-5 mb-2 px-1">
          <span className="text-[12px] text-muted">
            💬 <span className="font-semibold text-ink">{withCommentsCount}</span> of these listings have community opinions
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-social/30 border-t-social rounded-full animate-spin" />
        </div>
      )}

      {/* End of results */}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted mb-1">You&apos;ve seen it all</p>
          <p className="text-xs text-muted/50">
            Got an opinion? Click any listing to weigh in.
          </p>
        </div>
      )}
    </>
  );
}
