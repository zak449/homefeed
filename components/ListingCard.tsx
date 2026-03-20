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
  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-tag">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Listing type badge — always visible */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${
            listing.status === "off_market"
              ? "bg-amber-500 text-white"
              : isRent
                ? "bg-blue-500 text-white"
                : "bg-emerald-500 text-white"
          }`}>
            {listing.status === "off_market"
              ? "🏠 Off Market"
              : isRent ? "🔑 For Rent" : "🏡 For Sale"}
          </span>
        </div>

        {/* Comment count badge — THE social signal */}
        <div className="absolute top-2.5 right-2.5">
          {commentCount > 0 ? (
            <span className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg shadow-sm ${
              isOnFire
                ? "bg-[#FF6B2C] text-white text-[12px]"
                : isHot
                  ? "bg-[#FF6B2C] text-white text-[11px]"
                  : "bg-white/95 backdrop-blur-sm text-ink text-[11px]"
            }`}>
              {isOnFire ? (
                <span className="fire-animate">&#x1F525;</span>
              ) : isHot ? (
                "&#x1F525;"
              ) : (
                "&#x1F4AC;"
              )}
              {" "}{commentCount}
              {isOnFire && <span className="text-[10px] font-semibold ml-0.5 opacity-80">HOT</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-sm text-muted/60">
              &#x1F4AC; Be first
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        {/* Row 1: Price + type */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[15px] font-semibold text-ink tracking-tight">
            {price}
          </span>
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
            isRent ? "text-cold bg-blue-50" : "text-money bg-green-50"
          }`}>
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>

        {/* Row 2: Address */}
        <p className="text-[13px] text-ink mt-0.5 truncate">
          {listing.address}
        </p>
        <p className="text-[12px] text-muted truncate">
          {listing.city}, {listing.state}
        </p>

        {/* Row 3: Stats */}
        <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-muted">
          {listing.bedrooms != null && (
            <span>{listing.bedrooms} bd</span>
          )}
          {listing.bedrooms != null && listing.bathrooms != null && (
            <span className="text-border">·</span>
          )}
          {listing.bathrooms != null && (
            <span>{listing.bathrooms} ba</span>
          )}
          {listing.sqft != null && (
            <>
              <span className="text-border">·</span>
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </>
          )}
          {listedAgo && (
            <>
              <span className="text-border">·</span>
              <span>{listedAgo}</span>
            </>
          )}
        </div>

        {/* Top comment preview — what makes this different from Zillow */}
        {listing.topComment ? (
          <>
            {/* Always visible: compact social signal */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-social/15 text-social text-[9px] font-bold flex items-center justify-center shrink-0">
                {listing.topComment.name.charAt(0).toUpperCase()}
              </span>
              <p className="text-[11px] text-muted truncate">
                <span className="font-semibold text-ink">{listing.topComment.name}</span>{" "}
                left a take
              </p>
            </div>
            {/* Hover reveal: full comment */}
            <div className="listing-card-comment-reveal">
              <div className="mt-1.5 bg-tag rounded-lg px-3 py-2">
                <p className="text-[12px] text-muted line-clamp-2">
                  &ldquo;{listing.topComment.content}&rdquo;
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-2.5 border border-dashed border-border rounded-lg px-3 py-2">
            <p className="text-[11px] text-muted/50 text-center">
              No opinions yet — be the first to weigh in
            </p>
          </div>
        )}
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
