"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

/* ── Types ── */

type TrendingComment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  reactions: string[];
};

type DiscussedListing = {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listingType: string;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  photo: string | null;
  photos: string[];
  commentCount: number;
  comments: TrendingComment[];
};

type HottestTake = {
  commentId: string;
  name: string;
  content: string;
  createdAt: string;
  reactionCount: number;
  reactions: string[];
  listing: {
    id: string;
    address: string;
    city: string;
    state: string;
    price: number;
    listingType: string;
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    photo: string | null;
  };
};

type Neighborhood = {
  city: string;
  state: string;
  commentCount: number;
  listingCount: number;
  photos: string[];
};

type TabId = "discussed" | "hottest" | "neighborhoods";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "discussed", label: "Most Discussed", icon: "fire" },
  { id: "hottest", label: "Hottest Takes", icon: "zap" },
  { id: "neighborhoods", label: "Active Hoods", icon: "map" },
];

/* ── Helpers ── */

function fmtPrice(price: number, listingType: string) {
  return listingType === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function reactionMap(reactions: string[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r] = (counts[r] || 0) + 1;
  }
  return counts;
}

/** Heat level based on comment count */
function heatLevel(count: number): "hot" | "warm" | "mild" {
  if (count >= 10) return "hot";
  if (count >= 5) return "warm";
  return "mild";
}

const HEAT_COLORS = {
  hot: "bg-amber text-white",
  warm: "bg-amber/15 text-amber",
  mild: "bg-highlight text-secondary",
} as const;

/* ── Scroll-reveal hook ── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function RevealCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Tab icon components ── */

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const cls = active ? "text-amber" : "text-tertiary";
  if (name === "fire")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
      </svg>
    );
  if (name === "zap")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ── Main Component ── */

export default function TrendingTabs({
  discussed,
  hottest,
  neighborhoods,
}: {
  discussed: DiscussedListing[];
  hottest: HottestTake[];
  neighborhoods: Neighborhood[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("discussed");

  return (
    <>
      {/* Tab bar — pill style */}
      <div className="flex items-center gap-1 bg-highlight rounded-2xl p-1.5 mb-8 sticky top-4 z-20 shadow-soft backdrop-blur-sm">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-3 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-surface text-ink shadow-card"
                  : "text-tertiary hover:text-ink"
              }`}
            >
              <TabIcon name={tab.icon} active={isActive} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ").pop()}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="fade-up">
        {activeTab === "discussed" && <DiscussedTab listings={discussed} />}
        {activeTab === "hottest" && <HottestTab takes={hottest} />}
        {activeTab === "neighborhoods" && (
          <NeighborhoodsTab neighborhoods={neighborhoods} />
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 1: Most Discussed Listings — Social media post feel
   ════════════════════════════════════════════════════════════ */

function DiscussedTab({ listings }: { listings: DiscussedListing[] }) {
  if (listings.length === 0) return <EmptyState />;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-amber" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
            Most discussed
          </h2>
        </div>
        <span className="text-[11px] font-medium text-tertiary">
          {listings.length} active listings
        </span>
      </div>

      {listings.map((listing, index) => {
        const photo = listing.photo;
        const heat = heatLevel(listing.commentCount);
        const isNew = listing.comments.some(
          (c) =>
            Date.now() - new Date(c.createdAt).getTime() < 1000 * 60 * 60 * 2
        );

        return (
          <RevealCard key={listing.id} delay={Math.min(index * 60, 300)}>
            <div className="bg-surface rounded-2xl overflow-hidden border border-divider hover:border-amber/25 transition-all duration-300 hover:shadow-card-hover group">
              {/* Property photo — prominent */}
              {photo && (
                <Link href={`/listing/${listing.id}`} className="block relative">
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-highlight">
                    <FallbackImage
                      src={photo}
                      alt={listing.address}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {/* Heat badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${HEAT_COLORS[heat]}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {listing.commentCount} takes
                      </span>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/90 text-white backdrop-blur-sm">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                          </span>
                          New
                        </span>
                      )}
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-lg font-extrabold text-white leading-none drop-shadow-sm">
                        {fmtPrice(listing.price, listing.listingType)}
                      </p>
                      <p className="text-[13px] text-white/80 mt-0.5 truncate">
                        {listing.address}, {listing.city}
                      </p>
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 border border-white/10">
                        {listing.listingType === "rent" ? "Rental" : "For Sale"}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Card body — social post style */}
              <div className="p-4">
                {/* Compact listing info when no photo */}
                {!photo && (
                  <Link href={`/listing/${listing.id}`} className="block mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] font-bold text-ink">
                          {fmtPrice(listing.price, listing.listingType)}
                        </p>
                        <p className="text-[13px] text-secondary truncate">
                          {listing.address}, {listing.city}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${HEAT_COLORS[heat]}`}
                      >
                        {listing.commentCount} takes
                      </span>
                    </div>
                  </Link>
                )}

                {/* Comment previews — the social part */}
                {listing.comments.length > 0 && (
                  <div className="space-y-3">
                    {listing.comments.map((comment) => {
                      const rcounts = reactionMap(comment.reactions);
                      return (
                        <div key={comment.id} className="flex items-start gap-2.5">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber/20 to-amber/5 border border-amber/15 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-amber">
                              {initials(comment.name)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[13px] font-semibold text-ink">
                                {comment.name}
                              </span>
                              <span className="text-[11px] text-tertiary">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-[14px] text-ink/80 leading-relaxed line-clamp-2">
                              {comment.content}
                            </p>
                            {/* Reaction pills inline */}
                            {Object.keys(rcounts).length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5">
                                {Object.entries(rcounts).map(([emoji, count]) => (
                                  <span
                                    key={emoji}
                                    className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full bg-highlight text-secondary"
                                  >
                                    <span className="text-xs">{emoji}</span>
                                    <span className="font-medium">{count}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CTA footer */}
                <Link
                  href={`/listing/${listing.id}`}
                  className="flex items-center justify-between mt-4 pt-3 border-t border-divider/60"
                >
                  <span className="text-[12px] text-tertiary">
                    {listing.commentCount > 2
                      ? `+ ${listing.commentCount - 2} more takes`
                      : `${listing.commentCount} take${listing.commentCount !== 1 ? "s" : ""}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber hover:underline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Join the conversation
                  </span>
                </Link>
              </div>
            </div>
          </RevealCard>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 2: Hottest Takes — standalone comment cards
   ════════════════════════════════════════════════════════════ */

function HottestTab({ takes }: { takes: HottestTake[] }) {
  if (takes.length === 0) return <EmptyState />;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-amber" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
            Hottest takes
          </h2>
        </div>
        <span className="text-[11px] font-medium text-tertiary">
          {takes.length} takes with reactions
        </span>
      </div>

      {takes.map((take, index) => {
        const rcounts = reactionMap(take.reactions);
        const photo = take.listing.photo;
        const isTop = index < 3;

        return (
          <RevealCard key={take.commentId} delay={Math.min(index * 60, 300)}>
            <div
              className={`bg-surface rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-card-hover group ${
                isTop
                  ? "border-amber/20 shadow-glow"
                  : "border-divider hover:border-amber/20"
              }`}
            >
              <div className="p-5">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isTop
                        ? "bg-gradient-to-br from-amber to-amber/70 text-white"
                        : "bg-gradient-to-br from-amber/20 to-amber/5 border border-amber/15 text-amber"
                    }`}
                  >
                    <span className={`font-bold ${isTop ? "text-[11px]" : "text-[10px]"}`}>
                      {initials(take.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink">
                        {take.name}
                      </span>
                      {isTop && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                          Top take
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-tertiary">
                      {timeAgo(take.createdAt)}
                    </span>
                  </div>
                </div>

                {/* The comment text — large and readable */}
                <p className="text-[16px] sm:text-[17px] text-ink leading-relaxed line-clamp-5 mb-4">
                  {take.content}
                </p>

                {/* Reaction bar */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {Object.entries(rcounts).length > 0 ? (
                    Object.entries(rcounts).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="inline-flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full bg-highlight border border-divider/40 text-ink hover:border-amber/30 transition-colors cursor-default"
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className="font-semibold">{count}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-tertiary">
                      {take.reactionCount} reactions
                    </span>
                  )}
                </div>

                {/* Linked listing — small card */}
                <Link
                  href={`/listing/${take.listing.id}`}
                  className="flex items-center gap-3 p-2.5 -mx-1 rounded-xl bg-highlight/60 hover:bg-highlight transition-colors"
                >
                  {/* Tiny thumbnail */}
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-highlight">
                    {photo ? (
                      <FallbackImage
                        src={photo}
                        alt={take.listing.address}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-divider">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-tertiary mb-0.5">Commenting on</p>
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {fmtPrice(take.listing.price, take.listing.listingType)} &middot; {take.listing.address}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>

                {/* CTA */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-divider/50">
                  <Link
                    href={`/listing/${take.listing.id}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber hover:underline"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Reply
                  </Link>
                  <span className="text-divider">|</span>
                  <Link
                    href={`/listing/${take.listing.id}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-secondary hover:text-ink transition-colors"
                  >
                    See all takes
                  </Link>
                </div>
              </div>
            </div>
          </RevealCard>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 3: Trending Neighborhoods
   ════════════════════════════════════════════════════════════ */

function NeighborhoodsTab({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  if (neighborhoods.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-amber" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
            Trending neighborhoods
          </h2>
        </div>
        <span className="text-[11px] font-medium text-tertiary">
          {neighborhoods.length} active areas
        </span>
      </div>

      {neighborhoods.map((hood, index) => {
        const isTop = index < 3;
        const hasPhotos = hood.photos.length > 0;
        const sentiment =
          hood.commentCount >= 10
            ? "buzzing"
            : hood.commentCount >= 5
            ? "active"
            : "warming up";
        const sentimentColor =
          hood.commentCount >= 10
            ? "text-amber"
            : hood.commentCount >= 5
            ? "text-secondary"
            : "text-tertiary";

        return (
          <RevealCard key={`${hood.city}-${hood.state}`} delay={Math.min(index * 60, 300)}>
            <Link
              href={`/neighborhood/${encodeURIComponent(hood.city)}`}
              className="block group"
            >
              <div
                className={`bg-surface rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-card-hover ${
                  isTop
                    ? "border-amber/20 shadow-glow"
                    : "border-divider hover:border-amber/20"
                }`}
              >
                {/* Photo collage for top entries */}
                {isTop && hasPhotos && (
                  <div className="relative w-full aspect-[3/1] overflow-hidden bg-highlight">
                    <div className="absolute inset-0 grid grid-cols-4 gap-0.5">
                      {hood.photos.slice(0, 4).map((photo, pi) => (
                        <div key={pi} className="relative overflow-hidden">
                          <FallbackImage
                            src={photo}
                            alt={`${hood.city} listing`}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      ))}
                      {Array.from({
                        length: Math.max(0, 4 - hood.photos.length),
                      }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="bg-highlight flex items-center justify-center"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-divider">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          </svg>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-extrabold text-white leading-none">
                            {hood.city}
                          </p>
                          <p className="text-sm text-white/70 mt-0.5">
                            {hood.state}
                          </p>
                        </div>
                        {isTop && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                            #{index + 1} trending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-4">
                  {/* Compact row for non-top or no photos */}
                  {(!isTop || !hasPhotos) && (
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank */}
                      <div className="shrink-0 w-8 flex items-center justify-center">
                        <span
                          className={`text-lg font-bold font-display ${
                            isTop ? "text-amber" : "text-divider"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      {/* Mini photos */}
                      <div className="shrink-0 flex -space-x-2">
                        {hood.photos.slice(0, 3).map((photo, pi) => (
                          <div
                            key={pi}
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-surface"
                          >
                            <FallbackImage
                              src={photo}
                              alt={`${hood.city} listing`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                        {hood.photos.length === 0 && (
                          <div className="w-10 h-10 rounded-lg bg-highlight flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-divider">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-ink truncate">
                          {hood.city}
                        </p>
                        <p className="text-[12px] text-tertiary">
                          {hood.state}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats + sentiment */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full bg-amber/10 text-amber">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {hood.commentCount} take{hood.commentCount !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full bg-highlight text-secondary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      {hood.listingCount} listing{hood.listingCount !== 1 ? "s" : ""}
                    </span>
                    {/* Sentiment indicator */}
                    <span className={`text-[11px] font-semibold ${sentimentColor} ml-auto`}>
                      {sentiment}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-end mt-3 pt-3 border-t border-divider/50">
                    <span className="text-[12px] font-semibold text-amber group-hover:underline">
                      Explore neighborhood &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </RevealCard>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Empty state
   ════════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="relative bg-surface rounded-2xl border border-divider overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      <div className="relative px-8 py-14 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-extrabold text-ink tracking-tight mb-2">
          Be the first to start a conversation
        </h3>
        <p className="text-[14px] text-secondary leading-relaxed max-w-xs mx-auto mb-6">
          Search any listing and drop your take. Your opinion could start the next big debate.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#F5F5F5] text-[#0E0E0E] text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Find a listing
        </Link>
      </div>
    </div>
  );
}
