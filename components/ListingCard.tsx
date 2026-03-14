"use client";

import Link from "next/link";
import Image from "next/image";

const COLORS = [
  { bg: "bg-coral",     text: "text-white" },
  { bg: "bg-goldenrod", text: "text-ink" },
  { bg: "bg-sage",      text: "text-white" },
  { bg: "bg-sky",       text: "text-white" },
  { bg: "bg-lavender",  text: "text-white" },
  { bg: "bg-pink",      text: "text-white" },
];

type Listing = {
  id: string;
  address: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  photos: string[];
  agentName?: string | null;
  _count?: { comments: number };
  comments?: { _count: { reactions: number } }[];
};

export default function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const color = COLORS[index % COLORS.length];
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const commentCount = listing._count?.comments ?? 0;
  const reactionCount = listing.comments?.reduce((sum, c) => sum + c._count.reactions, 0) ?? 0;
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${(listing.price / 1000).toFixed(0)}k`;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden border-3 border-ink bg-white shadow-brute transition-all duration-150 hover:shadow-brute-lg hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      {/* Color block header */}
      <div className={`${color.bg} ${color.text} px-5 pt-5 pb-4 border-b-3 border-ink`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-base leading-tight uppercase truncate">{listing.address}</p>
            <p className="text-xs mt-0.5 opacity-80 truncate font-medium">
              {listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}, {listing.state}
            </p>
          </div>
          <span className="shrink-0 font-display text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border-2 border-ink bg-cream text-ink">
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>
        <p className="font-display text-3xl mt-3">{price}</p>
      </div>

      {/* Photo */}
      {photo && (
        <div className="relative h-44 overflow-hidden border-b-3 border-ink">
          <Image
            src={photo}
            alt={listing.address}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 py-4 bg-cream flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {listing.bedrooms  != null && <Pill>{listing.bedrooms} bd</Pill>}
          {listing.bathrooms != null && <Pill>{listing.bathrooms} ba</Pill>}
          {listing.sqft      != null && <Pill>{listing.sqft.toLocaleString()} sqft</Pill>}
          <Pill>{capitalize(listing.propertyType)}</Pill>
        </div>
        <div className="flex gap-1.5 ml-2 shrink-0">
          {commentCount > 0 && (
            <span className="font-display text-xs uppercase border-2 border-ink px-2 py-1 rounded-full bg-goldenrod text-ink shadow-brute-sm">
              💬 {commentCount}
            </span>
          )}
          {reactionCount > 0 && (
            <span className="font-display text-xs uppercase border-2 border-ink px-2 py-1 rounded-full bg-coral text-white shadow-brute-sm">
              🔥 {reactionCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border-2 border-ink bg-white text-ink">
      {children}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
