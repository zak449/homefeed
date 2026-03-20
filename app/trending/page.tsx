import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FallbackImage from "@/components/FallbackImage";

export const metadata: Metadata = {
  title: "Trending Conversations — homefeed",
  description:
    "See which listings people are talking about the most. Real opinions on real estate.",
};

export default async function TrendingPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "active" },
    orderBy: { comments: { _count: "desc" } },
    take: 20,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      photos: true,
      _count: { select: { comments: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        select: { name: true, content: true },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to homefeed
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter">
          Trending{" "}
          <span className="social-gradient">Conversations</span>
        </h1>
        <p className="text-base text-muted mt-3 leading-relaxed max-w-lg">
          The listings people can&rsquo;t stop talking about. Sorted by comment
          count &mdash; the more opinions, the higher it ranks.
        </p>
      </div>

      {/* Listing cards */}
      {listings.length === 0 ? (
        <div className="bg-tag rounded-xl p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No trending listings yet
          </p>
          <p className="text-sm text-muted mt-2">
            Be the first to start a conversation on a listing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-5 bg-social text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-social/90 transition-colors"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing, index) => {
            const photo = listing.photos[0];
            const price =
              listing.listingType === "rent"
                ? `$${listing.price.toLocaleString()}/mo`
                : `$${listing.price.toLocaleString()}`;

            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="block bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex gap-4 p-4">
                  {/* Rank number */}
                  <div className="shrink-0 w-8 flex items-start justify-center pt-1">
                    <span
                      className={`text-lg font-bold ${
                        index < 3 ? "social-gradient" : "text-muted/40"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-tag">
                    {photo ? (
                      <FallbackImage
                        src={photo}
                        alt={listing.address}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/20">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink truncate">
                          {price}
                        </p>
                        <p className="text-[13px] text-muted truncate">
                          {listing.address}
                        </p>
                        <p className="text-[12px] text-muted truncate">
                          {listing.city}, {listing.state}
                        </p>
                      </div>

                      {/* Comment count badge */}
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-lg ${
                          listing._count.comments >= 5
                            ? "bg-[#FF6B2C] text-white"
                            : "bg-tag text-ink"
                        }`}
                      >
                        &#x1f4ac; {listing._count.comments}
                      </span>
                    </div>

                    {/* Recent comments preview */}
                    {listing.comments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {listing.comments.map((comment, ci) => (
                          <div
                            key={ci}
                            className="bg-tag rounded-lg px-2.5 py-1.5"
                          >
                            <p className="text-[11px] text-muted line-clamp-1">
                              <span className="font-semibold text-ink">
                                {comment.name}
                              </span>{" "}
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
