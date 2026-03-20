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
  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border hover:border-border/0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-tag">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover ken-burns"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-tag to-cream">
            <span className="text-5xl opacity-30">🏠</span>
          </div>
        )}

        {/* Gradient overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Price overlay — on dark gradient */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-display font-bold text-xl drop-shadow-lg">
            {price}
          </span>
        </div>

        {/* Status badge — pill style */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            isRent
              ? "bg-cold/80 text-white"
              : "bg-money/80 text-white"
          }`}>
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>

        {/* Comment count */}
        {commentCount > 0 && (
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
              isHot
                ? "bg-accent text-white hot-pulse"
                : "bg-white/80 text-ink"
            }`}>
              {isHot ? "🔥" : "💬"} {commentCount}
            </span>
          </div>
        )}

        {/* Listed time — subtle bottom right */}
        {listedAgo && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[11px] font-medium text-white/80 drop-shadow">
              {listedAgo}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-display font-semibold text-sm text-ink leading-snug truncate group-hover:text-accent transition-colors">
          {listing.address}
        </h3>
        <p className="text-xs text-muted mt-0.5 truncate">
          {listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}, {listing.state}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2.5 mt-2.5 text-xs text-muted">
          {listing.bedrooms != null && (
            <span className="font-medium text-ink/70">{listing.bedrooms} <span className="text-muted/50">bd</span></span>
          )}
          {listing.bathrooms != null && (
            <span className="font-medium text-ink/70">{listing.bathrooms} <span className="text-muted/50">ba</span></span>
          )}
          {listing.sqft != null && (
            <span className="font-medium text-ink/70">{listing.sqft.toLocaleString()} <span className="text-muted/50">sqft</span></span>
          )}
          <span className="ml-auto text-muted/40 text-[11px]">
            {capitalize(listing.propertyType)}
          </span>
        </div>

        {/* Hot indicator */}
        {isHot && (
          <div className="mt-2.5 pt-2.5 border-t border-border">
            <p className="text-xs font-medium gradient-text">
              {commentCount} people are talking about this
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
