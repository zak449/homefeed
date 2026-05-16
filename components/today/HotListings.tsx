/**
 * HotListings — horizontally scrolling row of the 5 listings that picked up
 * the most takes in the last 24h. Server component; pure presentational.
 */

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

export interface HotListingItem {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listingType: string;
  photo: string | null;
  takes24h: number;
}

function fmtPrice(p: number, t: string): string {
  return t === "rent" ? `$${p.toLocaleString()}/mo` : `$${p.toLocaleString()}`;
}

export default function HotListings({ items }: { items: HotListingItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="pt-4 pb-2">
      <header className="px-5 mb-3">
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-tight">
          <span aria-hidden="true">🔥</span> Catching fire today
        </h2>
        <p className="text-xs text-secondary mt-0.5">
          The listings the comment section can&apos;t stop hitting.
        </p>
      </header>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((l) => (
          <Link
            key={l.id}
            href={`/listing/${l.id}`}
            className="group w-[180px] sm:w-[200px] shrink-0 snap-start rounded-2xl overflow-hidden bg-surface border border-divider/60 hover:border-amber/40 transition-colors"
          >
            <div className="relative aspect-[4/3] bg-highlight">
              {l.photo && (
                <FallbackImage
                  src={l.photo}
                  alt={l.address}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber/95 text-white shadow-sm tabular-nums">
                  +{l.takes24h} today
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-ink truncate leading-tight">
                {l.address.split(",")[0]}
              </p>
              <p className="text-xs text-secondary truncate">
                {l.city}, {l.state}
              </p>
              <p className="text-sm font-bold text-amber mt-1 tabular-nums">
                {fmtPrice(l.price, l.listingType)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
