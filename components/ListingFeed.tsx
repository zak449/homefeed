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

type CommunityMoment = {
  id: string;
  name: string;
  content: string;
  listingId: string;
  address: string;
  city: string;
  state: string;
};

type Props = {
  initialListings: Listing[];
  initialHasMore: boolean;
  searchParams: Record<string, string>;
  communityMoments?: CommunityMoment[];
};

export default function ListingFeed({
  initialListings,
  initialHasMore,
  searchParams,
}: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setListings(initialListings);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialListings, initialHasMore]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setFetchError(false);

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
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
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

  return (
    <>
      {/* Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-24 rounded skeleton" />
                <div className="h-4 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state with retry */}
      {fetchError && !loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <p className="text-sm text-secondary">
            Something went wrong loading more listings.
          </p>
          <button
            type="button"
            onClick={() => fetchMore()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-12">
          <p className="text-xs text-tertiary">You&apos;ve seen everything.</p>
        </div>
      )}
    </>
  );
}
