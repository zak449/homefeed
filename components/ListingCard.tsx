"use client";

import Link from "next/link";
import Image from "next/image";
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

  // Build specs pill text
  const specParts: string[] = [];
  if (listing.bedrooms != null) specParts.push(`${listing.bedrooms} bd`);
  if (listing.bathrooms != null) specParts.push(`${listing.bathrooms} ba`);
  if (listing.sqft != null) specParts.push(`${listing.sqft.toLocaleString()} sf`);
  const specs = specParts.join("  ·  ");

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden fade-up transition-all duration-300 hover:scale-[1.015] hover:shadow-glow-amber hover:border-[rgba(232,168,124,0.3)] border border-transparent"
      style={{ willChange: "transform" }}
    >
      {/* Full-bleed image — photo dominates at ~65% of card */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={listing.address}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <Image
            src="/images/listing-exterior.png"
            alt={listing.address}
            fill
            className="absolute inset-0 object-cover opacity-60 group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* TOP ROW — status badge + specs pill */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* Status badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md ${
            listing.status === "off_market"
              ? "bg-amber-500/90 text-white"
              : isRent
                ? "bg-blue-500/90 text-white"
                : "bg-black/70 text-white border border-white/10"
          }`}>
            {listing.status === "off_market" ? "Off Market" : isRent ? "For Rent" : "For Sale"}
          </span>

          {/* Specs pill */}
          {specs && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/10 whitespace-nowrap">
              {specs}
            </span>
          )}
        </div>

        {/* Community buzz badge — prominent when active */}
        {commentCount > 0 && (
          <div className="absolute bottom-[72px] right-3">
            <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${
              commentCount >= 5
                ? "bg-amber/90 text-white shadow-lg shadow-amber/20"
                : commentCount >= 3
                  ? "bg-black/80 text-[#E8A87C] border border-[rgba(232,168,124,0.3)]"
                  : "bg-black/60 text-white border border-white/10"
            }`}>
              {commentCount >= 5 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  {commentCount} people talking
                </>
              ) : (
                <>
                  {commentCount} {commentCount === 1 ? "take" : "takes"}
                </>
              )}
            </span>
            {/* Verified badge for 3+ comments */}
            {commentCount >= 3 && (
              <span className="block mt-1 text-[9px] text-center text-white/50 font-medium">
                Verified neighbors
              </span>
            )}
          </div>
        )}

        {/* BOTTOM OVERLAY — price, address, time */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              {/* Price — large amber */}
              <p className="text-[1.15rem] font-bold tracking-tight text-[#E8A87C] leading-none mb-1">
                {price}
              </p>
              {/* Address */}
              <p className="text-[13px] font-medium text-white/90 truncate leading-tight">
                {listing.address}
              </p>
              <p className="text-[11px] text-white/50 truncate">
                {listing.city}, {listing.state}
              </p>
            </div>
            {/* Listed time */}
            {listedAgo && (
              <span className="text-[11px] text-white/40 shrink-0 pb-0.5">{listedAgo}</span>
            )}
          </div>

          {/* Top comment preview */}
          {listing.topComment && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-[12px] text-white/70 leading-snug line-clamp-1 italic">
                &ldquo;{listing.topComment.content}&rdquo;
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                — {listing.topComment.name}
                {commentCount > 1 && (
                  <span className="ml-1.5 text-[#E8A87C]/70 font-medium not-italic">
                    +{commentCount - 1} more
                  </span>
                )}
              </p>
            </div>
          )}

          {!listing.topComment && (
            <p className="mt-2 text-[11px] text-white/30 group-hover:text-[#E8A87C]/60 transition-colors pt-2 border-t border-white/10">
              Be the first to speak up &rarr;
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
