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
  communityMoments = [],
}: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
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
      // Silently fail
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
      {/* Single column feed */}
      <div className="space-y-2">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-6 mt-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`skel-${i}`}>
              <div className="aspect-[16/10] rounded-card skeleton" />
              <div className="pt-3 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="h-5 w-28 rounded skeleton" />
                  <div className="h-4 w-16 rounded skeleton" />
                </div>
                <div className="h-4 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End of results */}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-12">
          <p className="text-caption text-tertiary">You&apos;ve seen it all.</p>
        </div>
      )}
    </>
  );
}
