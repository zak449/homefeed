"use client";

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

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

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;

  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const isHot = commentCount >= 5;
  const isOnFire = commentCount >= 10;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover bg-white border border-border"
    >
      {/* Horizontal layout: Photo left, comment right */}
      <div className="flex flex-col sm:flex-row">
        {/* Photo — 40% of the card */}
        <div className="relative sm:w-[40%] aspect-[4/3] sm:aspect-auto overflow-hidden bg-tag shrink-0">
          {photo ? (
            <FallbackImage
              src={photo}
              alt={listing.address}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted/20 min-h-[120px]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}

          {/* Listing type badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${
              listing.status === "off_market"
                ? "bg-amber-500 text-white"
                : isRent
                  ? "bg-blue-500 text-white"
                  : "bg-emerald-500 text-white"
            }`}>
              {listing.status === "off_market"
                ? "Off Market"
                : isRent ? "Rent" : "Sale"}
            </span>
          </div>
        </div>

        {/* Right side: Property info + comment */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          {/* Property info — compact */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-[15px] font-semibold text-ink tracking-tight">
                {price}
              </span>
              {commentCount > 0 && (
                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                  isOnFire
                    ? "bg-social text-white"
                    : isHot
                      ? "bg-social text-white"
                      : "bg-tag text-ink"
                }`}>
                  {isOnFire ? (
                    <span className="fire-animate">{"🔥"}</span>
                  ) : isHot ? "🔥" : "💬"}
                  {" "}{commentCount}
                </span>
              )}
            </div>
            <p className="text-[13px] text-ink mt-0.5 truncate">
              {listing.address}
            </p>
            <p className="text-[12px] text-muted truncate">
              {listing.city}, {listing.state}
              {listing.bedrooms != null && ` · ${listing.bedrooms} bd`}
              {listing.bathrooms != null && ` ${listing.bathrooms} ba`}
              {listing.sqft != null && ` · ${listing.sqft.toLocaleString()} sqft`}
            </p>
          </div>

          {/* THE COMMENT — equal weight to property info */}
          {listing.topComment ? (
            <div className="mt-2.5 bg-tag rounded-lg px-3 py-2.5 flex-1 flex flex-col justify-center">
              <p className="text-[11px] text-muted/60 mb-1 font-semibold">
                {listing.topComment.name}&apos;s take:
              </p>
              <p className="text-[13px] text-ink leading-relaxed line-clamp-3 font-medium">
                &ldquo;{listing.topComment.content}&rdquo;
              </p>
              {commentCount > 1 && (
                <p className="text-[11px] text-social font-semibold mt-1.5">
                  See all {commentCount} takes &rarr;
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2.5 border-2 border-dashed border-social/30 rounded-lg px-3 py-4 group-hover:border-social/60 group-hover:bg-social/[0.03] transition-all flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[13px] text-muted/70 font-medium group-hover:text-social transition-colors">
                No one&apos;s said anything yet.
              </p>
              <p className="text-[12px] text-social font-semibold mt-0.5">
                Be the first. &rarr;
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}
