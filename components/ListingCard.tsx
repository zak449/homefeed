"use client";

import Link from "next/link";

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
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;

  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : listing.price >= 1_000_000
      ? `$${(listing.price / 1_000_000).toFixed(listing.price % 1_000_000 === 0 ? 0 : 1)}M`
      : `$${(listing.price / 1_000).toFixed(0)}k`;

  const isHot = commentCount >= 5;

  // Time since listed
  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-tag">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-muted/30">
            🏠
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-ink font-display font-bold text-lg px-3 py-1 rounded-lg shadow-card">
            {price}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            isRent
              ? "bg-cold/90 text-white"
              : "bg-money/90 text-white"
          }`}>
            {isRent ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* Comment count — prominent */}
        {commentCount > 0 && (
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-card ${
              isHot
                ? "bg-accent text-white hot-pulse"
                : "bg-white/95 backdrop-blur-sm text-ink"
            }`}>
              {isHot ? "🔥" : "💬"} {commentCount}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        {/* Address */}
        <h3 className="font-display font-semibold text-sm text-ink leading-snug truncate">
          {listing.address}
        </h3>
        <p className="text-xs text-muted mt-0.5 truncate">
          {listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}, {listing.state}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2.5 text-xs text-muted">
          {listing.bedrooms != null && (
            <span className="font-medium">{listing.bedrooms} <span className="text-muted/60">bd</span></span>
          )}
          {listing.bathrooms != null && (
            <span className="font-medium">{listing.bathrooms} <span className="text-muted/60">ba</span></span>
          )}
          {listing.sqft != null && (
            <span className="font-medium">{listing.sqft.toLocaleString()} <span className="text-muted/60">sqft</span></span>
          )}
          {listedAgo && (
            <span className="text-muted/50 font-medium">{listedAgo} ago</span>
          )}
          <span className="ml-auto text-muted/50 font-medium">
            {capitalize(listing.propertyType)}
          </span>
        </div>

        {/* Hot take preview */}
        {isHot && (
          <div className="mt-2.5 pt-2.5 border-t border-border">
            <p className="text-xs text-accent font-semibold">
              🔥 {commentCount} people are talking about this listing
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}
