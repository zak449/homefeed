"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ListingCard from "@/components/ListingCard";
import type { FeedSection, RankedFeed } from "@/lib/feed-ranker";

type Props = {
  feed: RankedFeed;
};

/**
 * Section-aware feed. Renders the first section's cards eagerly and reveals
 * the next section as the user scrolls into it. Sticky section headers on
 * mobile so context never drifts away.
 */
export default function SmartListingFeed({ feed }: Props) {
  const [revealed, setRevealed] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver to reveal the next section when the user is near
  // the end of the current one.
  useEffect(() => {
    if (revealed >= feed.sections.length) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed((n) => Math.min(n + 1, feed.sections.length));
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [revealed, feed.sections.length]);

  const visible = useMemo(
    () => feed.sections.slice(0, revealed),
    [feed.sections, revealed],
  );

  if (feed.sections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-tertiary">No listings to show yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {visible.map((section) => (
        <SectionBlock key={section.key} section={section} />
      ))}

      {/* Sentinel sits at the end of the currently-rendered sections.
          Once it scrolls into view, we reveal the next one. */}
      {revealed < feed.sections.length && (
        <div ref={sentinelRef} className="h-1" aria-hidden />
      )}

      {revealed >= feed.sections.length && (
        <div className="text-center py-10">
          <p className="text-xs text-tertiary">
            You&apos;ve seen everything we picked for you.
          </p>
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section }: { section: FeedSection }) {
  const isCarousel = section.layout === "carousel";

  return (
    <section className="space-y-3">
      {/* Sticky header — small on desktop, pinned on mobile */}
      <header className="sticky top-12 z-10 -mx-4 sm:-mx-0 px-4 sm:px-0 py-2 bg-bg/85 backdrop-blur-sm border-b border-divider/40 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-xs sm:text-sm text-tertiary truncate">
              {section.subtitle}
            </p>
          )}
        </div>
      </header>

      {isCarousel ? (
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 sm:px-0 pb-2 snap-x snap-mandatory">
            {section.listings.map((listing) => (
              <div
                key={listing.id}
                className="snap-start shrink-0 w-[78vw] sm:w-[320px]"
              >
                <ListingCard listing={normalizeForCard(listing)} />
              </div>
            ))}
          </div>
          {/* Right-edge fade hint */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-bg to-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {section.listings.map((listing) => (
            <ListingCard key={listing.id} listing={normalizeForCard(listing)} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Coerce the ranker's flexible listing type into exactly what ListingCard
 * wants. The card is strict about a few fields; this just fills the gaps
 * without modifying the card.
 */
function normalizeForCard(l: FeedSection["listings"][number]) {
  return {
    id: l.id,
    address: l.address ?? "",
    city: l.city ?? "",
    state: l.state ?? "",
    neighborhood: l.neighborhood ?? null,
    price: l.price,
    listingType: l.listingType ?? "sale",
    propertyType: l.propertyType ?? "",
    status: l.status ?? "active",
    bedrooms: l.bedrooms ?? null,
    bathrooms: l.bathrooms ?? null,
    sqft: l.sqft ?? null,
    photos: l.photos ?? [],
    agentName: l.agentName ?? null,
    createdAt: l.createdAt ?? undefined,
    _count: l._count,
    topComment: l.topComment ?? null,
  };
}
