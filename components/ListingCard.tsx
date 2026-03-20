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
  const listedAgo = listing.createdAt ? timeAgo(String(listing.createdAt)) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-tag">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={listing.address}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-muted/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Comment count */}
        {commentCount > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              isHot
                ? "bg-hot text-white"
                : "bg-white/90 backdrop-blur-sm text-ink"
            }`}>
              {isHot ? "🔥" : "💬"} {commentCount}
            </span>
          </div>
        )}
      </div>

      {/* Info — tight, clean hierarchy */}
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

        {/* Top comment preview */}
        {listing.topComment && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[12px] text-muted line-clamp-2">
              <span className="font-medium text-ink">{listing.topComment.name}</span>{" "}
              {listing.topComment.content}
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
