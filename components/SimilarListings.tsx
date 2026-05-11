import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import { prisma } from "@/lib/prisma";
import { getSimilarListings } from "@/lib/feed-ranker";
import type { ScoringListing } from "@/lib/recommendations";

type Props = {
  listingId: string;
  /** How many to show. Defaults to 6. */
  limit?: number;
};

/**
 * Server component. Pulls the target listing, builds a candidate pool from
 * the same city (plus a wider state-level fallback if the city is thin),
 * and renders the top N most-similar listings.
 *
 * Mobile: horizontal-scroll carousel. Desktop: 3-column grid.
 */
export default async function SimilarListings({ listingId, limit = 6 }: Props) {
  const target = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      neighborhood: true,
      latitude: true,
      longitude: true,
      price: true,
      listingType: true,
      propertyType: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      comments: { select: { content: true }, take: 30, orderBy: { createdAt: "desc" } },
    },
  });

  if (!target) return null;

  // Candidate pool: same city + active, plus a broader state-level
  // backstop so we always have something to rank against.
  const cityPool = await prisma.listing.findMany({
    where: {
      id: { not: listingId },
      city: target.city,
      status: "active",
      listingType: target.listingType,
    },
    take: 60,
    select: candidateSelect,
  });

  let pool = cityPool;
  if (pool.length < 12) {
    const statePool = await prisma.listing.findMany({
      where: {
        id: { not: listingId },
        state: target.state,
        city: { not: target.city },
        status: "active",
        listingType: target.listingType,
      },
      take: 60,
      select: candidateSelect,
    });
    const seen = new Set(pool.map((p) => p.id));
    pool = [...pool, ...statePool.filter((p) => !seen.has(p.id))];
  }

  const similar = getSimilarListings(target as ScoringListing, pool, limit);
  if (similar.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-title text-ink font-bold tracking-tight">
          More like this
        </h2>
        <span className="text-caption text-tertiary">
          {similar.length} match{similar.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Mobile: horizontal scroll. Desktop: grid. */}
      <div className="sm:hidden relative -mx-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 pb-2 snap-x snap-mandatory">
          {similar.map((l) => (
            <div key={l.id} className="snap-start shrink-0 w-[70vw]">
              <SimilarCard listing={l} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-bg to-transparent" />
      </div>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {similar.map((l) => (
          <SimilarCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}

const candidateSelect = {
  id: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  neighborhood: true,
  latitude: true,
  longitude: true,
  price: true,
  listingType: true,
  propertyType: true,
  bedrooms: true,
  bathrooms: true,
  sqft: true,
  photos: true,
  createdAt: true,
  _count: { select: { comments: true } },
  comments: {
    select: { content: true },
    take: 10,
    orderBy: { createdAt: "desc" as const },
  },
} as const;

function SimilarCard({
  listing,
}: {
  listing: {
    id: string;
    address?: string | null;
    city?: string | null;
    price: number;
    listingType?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    sqft?: number | null;
    photos?: string[];
    _count?: { comments: number };
  };
}) {
  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  const photo = listing.photos?.[0] ?? null;
  const takes = listing._count?.comments ?? 0;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden bg-surface border border-divider hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-highlight">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={listing.address ?? "Listing"}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-tertiary/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface/90 text-white backdrop-blur-sm">
            {isRent ? "Rent" : "Sale"}
          </span>
        </div>
        {takes > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber/90 text-white backdrop-blur-sm">
              {takes} take{takes === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-ink tracking-tight">{price}</p>
          {(listing.bedrooms != null || listing.bathrooms != null) && (
            <p className="text-xs text-secondary shrink-0">
              {listing.bedrooms != null ? `${listing.bedrooms}bd` : ""}
              {listing.bedrooms != null && listing.bathrooms != null ? " · " : ""}
              {listing.bathrooms != null ? `${listing.bathrooms}ba` : ""}
            </p>
          )}
        </div>
        <p className="text-xs text-secondary truncate mt-0.5">
          {listing.address}
          {listing.city ? `, ${listing.city}` : ""}
        </p>
      </div>
    </Link>
  );
}
