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

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;

  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-hover"
    >
      {/* Photo — full width, visual hook */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tertiary/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Type badge — small, on photo */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            listing.status === "off_market"
              ? "bg-amber-500/90 text-white"
              : isRent
                ? "bg-blue-600/90 text-white"
                : "bg-white/90 text-ink"
          }`}>
            {listing.status === "off_market" ? "Off Market" : isRent ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* Comment count — social signal on photo */}
        {commentCount > 0 && (
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
              commentCount >= 5
                ? "bg-ink/80 text-white"
                : "bg-white/90 text-ink"
            }`}>
              💬 {commentCount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price row */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold text-ink tracking-tight">{price}</h3>
          {listedAgo && (
            <span className="text-xs text-tertiary">{listedAgo}</span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-secondary mt-0.5 truncate">
          {listing.address}
        </p>
        <p className="text-xs text-tertiary truncate">
          {listing.city}, {listing.state}
          {listing.bedrooms != null && ` · ${listing.bedrooms} bd`}
          {listing.bathrooms != null && ` · ${listing.bathrooms} ba`}
          {listing.sqft != null && ` · ${listing.sqft.toLocaleString()} sqft`}
        </p>

        {/* Comment preview — THE social layer */}
        {listing.topComment ? (
          <div className="mt-3 pt-3 border-t border-divider">
            <p className="text-sm text-ink leading-relaxed line-clamp-2">
              &ldquo;{listing.topComment.content}&rdquo;
            </p>
            <p className="text-xs text-tertiary mt-1">
              — {listing.topComment.name}
              {commentCount > 1 && (
                <span className="ml-2 text-secondary font-medium">
                  +{commentCount - 1} more
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-divider">
            <p className="text-xs text-tertiary group-hover:text-secondary transition-colors">
              Be the first to share your take →
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
