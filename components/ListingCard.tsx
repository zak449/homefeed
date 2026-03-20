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

  const typeLabel = listing.status === "off_market"
    ? "Off Market"
    : isRent ? "For Rent" : "For Sale";

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block transition-shadow duration-200 hover:shadow-hover rounded-card"
    >
      {/* Photo -- full width, 16:10 aspect */}
      <div className="relative aspect-[16/10] rounded-card overflow-hidden bg-surface">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tertiary/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
      </div>

      {/* Content below photo */}
      <div className="pt-3 pb-4">
        {/* Price + type */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-headline text-ink">
            {price}
          </span>
          <span className="text-caption text-secondary">
            {typeLabel}
          </span>
        </div>

        {/* Address */}
        <p className="text-body text-secondary mt-0.5 truncate">
          {listing.address} &middot; {listing.city}, {listing.state}
        </p>

        {/* Stats */}
        <p className="text-caption text-tertiary mt-0.5">
          {listing.bedrooms != null && `${listing.bedrooms} bd`}
          {listing.bathrooms != null && ` \u00b7 ${listing.bathrooms} ba`}
          {listing.sqft != null && ` \u00b7 ${listing.sqft.toLocaleString()} sqft`}
        </p>

        {/* Comment preview */}
        {listing.topComment ? (
          <div className="mt-3 bg-surface rounded-card px-4 py-3">
            <p className="text-body text-ink leading-relaxed line-clamp-3">
              &ldquo;{listing.topComment.content}&rdquo;
              <span className="text-secondary ml-1">&mdash; {listing.topComment.name}</span>
            </p>
            {commentCount > 1 && (
              <p className="text-caption text-tertiary mt-2">
                {commentCount} takes &rarr;
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-caption text-tertiary">
            No takes yet &mdash; be first &rarr;
          </p>
        )}
      </div>
    </Link>
  );
}
