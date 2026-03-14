import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import { Prisma } from "@prisma/client";

type SearchParams = { [key: string]: string | string[] | undefined };

function str(v: SearchParams[string]) {
  return typeof v === "string" ? v : undefined;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp          = await searchParams;
  const city        = str(sp.city);
  const listingType = str(sp.type) as "sale" | "rent" | undefined;
  const propertyType = str(sp.propertyType);
  const minPrice    = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice    = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const minBeds     = sp.minBeds  ? Number(sp.minBeds)  : undefined;
  const page        = Math.max(1, Number(sp.page ?? 1));
  const perPage     = 12;

  const where: Prisma.ListingWhereInput = {
    ...(city && {
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
        { zip: { contains: city } },
        { neighborhood: { contains: city, mode: "insensitive" } },
      ],
    }),
    ...(listingType && { listingType }),
    ...(propertyType && { propertyType }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(minBeds !== undefined && { bedrooms: { gte: minBeds } }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, address: true, city: true, state: true, neighborhood: true,
        price: true, listingType: true, propertyType: true,
        bedrooms: true, bathrooms: true, sqft: true, photos: true, agentName: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const hasFilters = !!(city || listingType || propertyType || minPrice || maxPrice || minBeds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-display text-5xl sm:text-6xl text-ink leading-tight mb-3">
          Find your next<br />
          <span className="text-coral">favorite place.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Browse homes for sale and rent, see what the community thinks, and connect directly with listing agents.
        </p>
      </div>

      {/* Search bar */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* Results header */}
      <div className="flex items-center justify-between mt-10 mb-6">
        <h2 className="font-display text-2xl text-ink">
          {hasFilters
            ? `${total} ${total === 1 ? "result" : "results"}`
            : "All listings"}
        </h2>
        {total > 0 && (
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-display text-2xl text-ink mb-2">No listings found</p>
          <p className="text-gray-500">Try adjusting your filters or searching a different city.</p>
          <a href="/" className="inline-block mt-6 bg-coral text-white font-bold px-6 py-3 rounded-xl hover:bg-coral/90 transition-colors text-sm">
            Clear filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={(page - 1) * perPage + i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(
              Object.fromEntries(
                Object.entries(sp)
                  .filter(([, v]) => typeof v === "string") as [string, string][]
              )
            );
            params.set("page", String(p));
            return (
              <a
                key={p}
                href={`/?${params.toString()}`}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  p === page ? "bg-coral text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
