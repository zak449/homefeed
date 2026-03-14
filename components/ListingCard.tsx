"use client";

import Link from "next/link";
import Image from "next/image";

const COLORS = [
  { bg: "bg-coral",     text: "text-white" },
  { bg: "bg-goldenrod", text: "text-ink" },
  { bg: "bg-sage",      text: "text-ink" },
  { bg: "bg-sky",       text: "text-white" },
  { bg: "bg-lavender",  text: "text-white" },
  { bg: "bg-clay",      text: "text-white" },
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
};

export default function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const color = COLORS[index % COLORS.length];
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${(listing.price / 1000).toFixed(0)}k`;

  return (
    <Link href={`/listing/${listing.id}`} className="group block rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 bg-white">
      {/* Color block header */}
      <div className={`${color.bg} ${color.text} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight font-normal truncate">{listing.address}</p>
            <p className="text-sm mt-0.5 opacity-80 truncate">{listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}, {listing.state}</p>
          </div>
          <span className={`shrink-0 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${color.text === "text-white" ? "border-white/40 bg-white/20" : "border-ink/20 bg-ink/10"}`}>
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>
        <p className="font-display text-3xl mt-3">{price}</p>
      </div>

      {/* Photo */}
      {photo && (
        <div className="relative h-44 overflow-hidden">
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
        <div className="flex gap-3 flex-wrap">
          {listing.bedrooms != null && (
            <Pill>{listing.bedrooms} bd</Pill>
          )}
          {listing.bathrooms != null && (
            <Pill>{listing.bathrooms} ba</Pill>
          )}
          {listing.sqft != null && (
            <Pill>{listing.sqft.toLocaleString()} sqft</Pill>
          )}
          <Pill type={listing.propertyType}>{capitalize(listing.propertyType)}</Pill>
        </div>
        {(listing._count?.comments ?? 0) > 0 && (
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            💬 {listing._count?.comments}
          </span>
        )}
      </div>
    </Link>
  );
}

function Pill({ children, type }: { children: React.ReactNode; type?: string }) {
  const typeColors: Record<string, string> = {
    house:     "bg-coral/10 text-coral",
    condo:     "bg-sky/10 text-sky",
    townhouse: "bg-sage/10 text-sage",
    apartment: "bg-lavender/10 text-lavender",
  };
  const cls = type ? typeColors[type] ?? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
