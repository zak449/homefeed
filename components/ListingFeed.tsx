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

  // Build grid items: listings + community moments injected every 4th position
  const gridItems: { type: "listing"; data: Listing }[] | { type: "moment"; data: CommunityMoment }[] = [];
  let momentIdx = 0;

  const items: ({ type: "listing"; data: Listing } | { type: "moment"; data: CommunityMoment })[] = [];
  for (let i = 0; i < listings.length; i++) {
    items.push({ type: "listing", data: listings[i] });

    // After every 4th listing, inject a community moment if available
    if ((i + 1) % 4 === 0 && momentIdx < communityMoments.length) {
      items.push({ type: "moment", data: communityMoments[momentIdx] });
      momentIdx++;
    }
  }

  return (
    <>
      {/* Social activity summary bar */}
      {withCommentsCount > 0 && (
        <div className="flex items-center gap-2 mt-5 mb-2 px-1">
          <span className="text-[12px] text-muted">
            {"\uD83D\uDCAC"} <span className="font-semibold text-ink">{withCommentsCount}</span> of these listings have community opinions
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-3">
        {items.map((item, idx) => {
          if (item.type === "listing") {
            return <ListingCard key={item.data.id} listing={item.data} />;
          }

          // Community moment card — spans full width of the grid
          const moment = item.data;
          return (
            <a
              key={`moment-${moment.id}`}
              href={`/listing/${moment.listingId}`}
              className="col-span-1 lg:col-span-2 bg-gradient-to-r from-orange-50 via-white to-orange-50 border border-orange-200/50 rounded-xl px-5 py-4 flex items-start gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-social/10 text-social text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {moment.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink leading-relaxed">
                  <span className="font-semibold">{moment.name}</span>
                  <span className="text-muted"> on </span>
                  <span className="font-medium">{moment.address}</span>
                </p>
                <p className="text-[13px] text-muted mt-1 line-clamp-2">
                  &ldquo;{moment.content}&rdquo;
                </p>
                <p className="text-[11px] text-muted/50 mt-1.5">
                  {moment.city}, {moment.state}
                  <span className="ml-2 text-social font-semibold group-hover:underline">
                    View listing &rarr;
                  </span>
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading skeletons while fetching next page */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`skel-${i}`} className="rounded-xl overflow-hidden animate-fade-in">
              <div className="aspect-[4/3] rounded-xl skeleton" />
              <div className="pt-3 pb-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="h-4 w-24 rounded skeleton" />
                  <div className="h-5 w-12 rounded skeleton" />
                </div>
                <div className="h-3.5 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-3 w-10 rounded skeleton" />
                  <div className="h-3 w-10 rounded skeleton" />
                  <div className="h-3 w-16 rounded skeleton" />
                </div>
                <div className="mt-2.5 rounded-lg skeleton h-14" />
              </div>
            </div>
          ))}
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
