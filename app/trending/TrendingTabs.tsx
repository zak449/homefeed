"use client";

import { useState } from "react";
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

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "discussed", label: "Most Discussed", emoji: "\uD83D\uDCAC" },
  { id: "hottest", label: "Hottest Takes", emoji: "\uD83D\uDD25" },
  { id: "neighborhoods", label: "Active Hoods", emoji: "\uD83C\uDFD8\uFE0F" },
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

/* ── Component ── */

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
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-highlight rounded-2xl p-1.5 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-3 px-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-surface text-ink shadow-card"
                : "text-tertiary hover:text-ink"
            }`}
          >
            <span className="text-sm">{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ").pop()}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "discussed" && (
        <DiscussedTab listings={discussed} />
      )}
      {activeTab === "hottest" && (
        <HottestTab takes={hottest} />
      )}
      {activeTab === "neighborhoods" && (
        <NeighborhoodsTab neighborhoods={neighborhoods} />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 1: Most Discussed Listings
   ════════════════════════════════════════════════════════════ */

function DiscussedTab({ listings }: { listings: DiscussedListing[] }) {
  if (listings.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {listings.map((listing, index) => {
        const photo = listing.photo;
        const isTop3 = index < 3;
        const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

        return (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="block group"
          >
            <div
              className={`bg-surface rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-card-hover ${
                isTop3
                  ? "border-amber/25 shadow-glow"
                  : "border-divider hover:border-amber/20"
              }`}
            >
              {/* Big photo for top 3 */}
              {isTop3 && photo && (
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-highlight">
                  <FallbackImage
                    src={photo}
                    alt={listing.address}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-12">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-extrabold text-white leading-none">
                          {fmtPrice(listing.price, listing.listingType)}
                        </p>
                        <p className="text-sm text-white/80 mt-0.5 truncate">
                          {listing.address}, {listing.city}
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {listing.commentCount} takes
                      </span>
                    </div>
                  </div>
                  {/* Rank badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10">
                      {medals[index]} #{index + 1}
                    </span>
                  </div>
                  {/* Listing type */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10">
                      {listing.listingType === "rent" ? "Rental" : "For Sale"}
                    </span>
                  </div>
                </div>
              )}

              {/* Card body */}
              <div className="p-4">
                {/* Compact header for non-top-3 */}
                {(!isTop3 || !photo) && (
                  <div className="flex gap-4 mb-3">
                    {/* Rank */}
                    <div className="shrink-0 w-8 flex items-start justify-center pt-0.5">
                      <span
                        className={`text-lg font-bold font-display ${
                          isTop3 ? "text-amber" : "text-divider"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    {/* Thumbnail */}
                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-highlight">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={listing.address}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-divider">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-ink truncate">
                        {fmtPrice(listing.price, listing.listingType)}
                      </p>
                      <p className="text-[13px] text-secondary truncate">
                        {listing.address}
                      </p>
                      <p className="text-[12px] text-tertiary">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                    {/* Comment badge */}
                    <span
                      className={`shrink-0 self-start inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full ${
                        listing.commentCount >= 10
                          ? "bg-amber text-white"
                          : listing.commentCount >= 5
                          ? "bg-amber/10 text-amber"
                          : "bg-highlight text-secondary"
                      }`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {listing.commentCount}
                    </span>
                  </div>
                )}

                {/* Property details pill row (for top 3 with photo) */}
                {isTop3 && photo && (
                  <div className="flex items-center gap-3 text-sm text-secondary mb-3">
                    {listing.bedrooms != null && <span>{listing.bedrooms} bd</span>}
                    {listing.bathrooms != null && <span>{listing.bathrooms} ba</span>}
                    {listing.sqft != null && (
                      <span>{listing.sqft.toLocaleString()} sqft</span>
                    )}
                    {listing.propertyType && (
                      <span className="text-tertiary capitalize">
                        {listing.propertyType}
                      </span>
                    )}
                  </div>
                )}

                {/* Recent comments preview */}
                {listing.comments.length > 0 && (
                  <div className="space-y-2">
                    {listing.comments.map((comment) => {
                      const rcounts = reactionMap(comment.reactions);
                      return (
                        <div
                          key={comment.id}
                          className="bg-highlight rounded-xl px-3.5 py-3"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-amber">
                                {initials(comment.name)}
                              </span>
                            </div>
                            <span className="text-[12px] font-semibold text-ink">
                              {comment.name}
                            </span>
                            <span className="text-[11px] text-tertiary">
                              {timeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-[13px] text-ink/80 line-clamp-2 leading-relaxed">
                            &ldquo;{comment.content}&rdquo;
                          </p>
                          {Object.keys(rcounts).length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {Object.entries(rcounts).map(([emoji, count]) => (
                                <span
                                  key={emoji}
                                  className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-surface border border-divider/60"
                                >
                                  <span className="text-xs">{emoji}</span>
                                  <span className="font-medium text-secondary">
                                    {count}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer CTA */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider/60">
                  <span className="text-xs text-tertiary">
                    {listing.commentCount} take
                    {listing.commentCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-semibold text-amber group-hover:underline">
                    Read all takes &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 2: Hottest Takes — individual comments with most reactions
   ════════════════════════════════════════════════════════════ */

function HottestTab({ takes }: { takes: HottestTake[] }) {
  if (takes.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {takes.map((take, index) => {
        const rcounts = reactionMap(take.reactions);
        const photo = take.listing.photo;
        const isTop3 = index < 3;
        const flames = isTop3
          ? Array(3 - index)
              .fill("\uD83D\uDD25")
              .join("")
          : "";

        return (
          <Link
            key={take.commentId}
            href={`/listing/${take.listing.id}`}
            className="block group"
          >
            <div
              className={`bg-surface rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-card-hover ${
                isTop3
                  ? "border-amber/25 shadow-glow"
                  : "border-divider hover:border-amber/20"
              }`}
            >
              {/* Big photo for top 3 */}
              {isTop3 && photo && (
                <div className="relative w-full aspect-[2/1] overflow-hidden bg-highlight">
                  <FallbackImage
                    src={photo}
                    alt={take.listing.address}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10">
                    <p className="text-lg font-extrabold text-white leading-none">
                      {fmtPrice(take.listing.price, take.listing.listingType)}
                    </p>
                    <p className="text-sm text-white/80 mt-0.5 truncate">
                      {take.listing.address}, {take.listing.city}
                    </p>
                  </div>
                  {/* Fire badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber/90 backdrop-blur-sm text-white">
                      {flames} #{index + 1} Hottest
                    </span>
                  </div>
                </div>
              )}

              {/* Comment body */}
              <div className="p-4">
                {/* Compact listing context for non-top-3 */}
                {(!isTop3 || !photo) && (
                  <div className="flex gap-3 mb-3 pb-3 border-b border-divider/60">
                    <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-highlight">
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
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-ink truncate">
                        {fmtPrice(take.listing.price, take.listing.listingType)}
                      </p>
                      <p className="text-[12px] text-secondary truncate">
                        {take.listing.address}, {take.listing.city}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-amber self-center">
                      #{index + 1}
                    </span>
                  </div>
                )}

                {/* The take itself */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-amber">
                      {initials(take.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-ink">
                        {take.name}
                      </span>
                      <span className="text-[11px] text-tertiary">
                        {timeAgo(take.createdAt)}
                      </span>
                    </div>
                    <p className="text-[15px] text-ink leading-relaxed line-clamp-4 font-serif italic">
                      &ldquo;{take.content}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Reaction pills */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(rcounts).length > 0 ? (
                      Object.entries(rcounts).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-highlight border border-divider/60 text-ink"
                        >
                          <span className="text-sm">{emoji}</span>
                          <span className="font-medium">{count}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-tertiary">
                        {take.reactionCount} reactions
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-amber group-hover:underline shrink-0">
                    See all takes &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab 3: Most Active Neighborhoods
   ════════════════════════════════════════════════════════════ */

function NeighborhoodsTab({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  if (neighborhoods.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {neighborhoods.map((hood, index) => {
        const isTop3 = index < 3;
        const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
        const hasPhotos = hood.photos.length > 0;

        return (
          <Link
            key={`${hood.city}-${hood.state}`}
            href={`/neighborhood/${encodeURIComponent(hood.city)}`}
            className="block group"
          >
            <div
              className={`bg-surface rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-card-hover ${
                isTop3
                  ? "border-amber/25 shadow-glow"
                  : "border-divider hover:border-amber/20"
              }`}
            >
              {/* Photo collage for top 3 */}
              {isTop3 && hasPhotos && (
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
                    {/* Fill remaining slots if fewer than 4 photos */}
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
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {/* City name overlay */}
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
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                        {medals[index]} #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card body */}
              <div className="p-4">
                {/* Compact row for non-top-3 or no photos */}
                {(!isTop3 || !hasPhotos) && (
                  <div className="flex items-center gap-4 mb-3">
                    <div className="shrink-0 w-8 flex items-center justify-center">
                      <span
                        className={`text-lg font-bold font-display ${
                          isTop3 ? "text-amber" : "text-divider"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    {/* Mini photo strip */}
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
                          <span className="text-base">{"\uD83C\uDFD8\uFE0F"}</span>
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

                {/* Stats row */}
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
                  <span className="ml-auto text-xs font-semibold text-amber group-hover:underline shrink-0">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
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
    <div className="bg-surface rounded-2xl border border-divider p-10 text-center">
      <div className="text-4xl mb-4">{"\uD83C\uDFE0"}</div>
      <p className="font-display text-lg font-bold text-ink">
        No trending activity yet
      </p>
      <p className="text-sm text-secondary mt-2 max-w-sm mx-auto">
        Be the first to start a conversation. Browse listings and share your take.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 mt-6 bg-ink text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all"
      >
        Browse listings &rarr;
      </Link>
    </div>
  );
}
