import { prisma } from "@/lib/prisma";
import FallbackImage from "@/components/FallbackImage";
import Link from "next/link";

export const metadata = {
  title: "Red Flags | Gwaky",
  description: "Listings the community is warning about",
};

function fmtPrice(price: number, listingType: string) {
  return listingType === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function getCredibilityTag(content: string): { label: string; className: string } {
  const lower = content.toLowerCase();
  if (/\b(years?|lived here|moved|since)\b/.test(lower)) {
    return { label: "Local", className: "bg-amber-900/30 text-amber-400 border border-amber-700/40" };
  }
  if (/\b(rent|tenant|lease)\b/.test(lower)) {
    return { label: "Past Renter", className: "bg-blue-900/30 text-blue-400 border border-blue-700/40" };
  }
  if (/\b(neighbor|next door|block)\b/.test(lower)) {
    return { label: "Neighbor", className: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40" };
  }
  if (/\b(drive|visited|looked at)\b/.test(lower)) {
    return { label: "Drive-by", className: "bg-gray-700/40 text-gray-400 border border-gray-600/40 italic" };
  }
  return { label: "Anon", className: "bg-gray-700/40 text-gray-500 border border-gray-600/40" };
}

export default async function RedFlagsPage() {
  // Fetch comments with most flag reactions
  const flaggedCommentIds = await prisma.$queryRaw<{ id: string; flag_count: bigint }[]>`
    SELECT c.id, COUNT(r.id) AS flag_count
    FROM "Comment" c
    INNER JOIN "Reaction" r ON r."commentId" = c.id AND r.type = '🚩'
    GROUP BY c.id
    ORDER BY COUNT(r.id) DESC
    LIMIT 50
  `;

  // Fetch listings with most total flag reactions across all comments
  const flaggedListingIds = await prisma.$queryRaw<{ listing_id: string; total_flags: bigint }[]>`
    SELECT c."listingId" AS listing_id, COUNT(r.id) AS total_flags
    FROM "Comment" c
    INNER JOIN "Reaction" r ON r."commentId" = c.id AND r.type = '🚩'
    GROUP BY c."listingId"
    ORDER BY COUNT(r.id) DESC
    LIMIT 20
  `;

  const flaggedComments = flaggedCommentIds.length > 0
    ? await prisma.comment.findMany({
        where: { id: { in: flaggedCommentIds.map((r) => r.id) } },
        include: {
          listing: {
            select: {
              id: true,
              address: true,
              city: true,
              state: true,
              price: true,
              photos: true,
              listingType: true,
            },
          },
          reactions: true,
        },
      })
    : [];

  // Sort by flag count
  const flagCountMap = new Map(flaggedCommentIds.map((r) => [r.id, Number(r.flag_count)]));
  const sortedFlagged = flaggedComments.sort(
    (a, b) => (flagCountMap.get(b.id) ?? 0) - (flagCountMap.get(a.id) ?? 0)
  );

  // Fetch flagged listings details
  const flaggedListings = flaggedListingIds.length > 0
    ? await prisma.listing.findMany({
        where: { id: { in: flaggedListingIds.map((r) => r.listing_id) } },
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          photos: true,
          listingType: true,
          _count: { select: { comments: true } },
        },
      })
    : [];

  const listingFlagMap = new Map(flaggedListingIds.map((r) => [r.listing_id, Number(r.total_flags)]));
  const sortedFlaggedListings = flaggedListings.sort(
    (a, b) => (listingFlagMap.get(b.id) ?? 0) - (listingFlagMap.get(a.id) ?? 0)
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: "radial-gradient(circle, #dc2626, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto px-5 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors mb-4 inline-block">&larr; Back to Gwaky</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Red Flags <span className="inline-block">&#x1F6A9;</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg">
            Listings the community is warning about
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Flagged Listings summary */}
        {sortedFlaggedListings.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-extrabold tracking-[0.1em] uppercase text-red-400 mb-4">Most Flagged Listings</h2>
            <div className="space-y-3">
              {sortedFlaggedListings.slice(0, 10).map((listing) => {
                const photo = listing.photos[0];
                const shortAddr = listing.address.split(",")[0];
                const flags = listingFlagMap.get(listing.id) ?? 0;

                return (
                  <Link key={listing.id} href={`/listing/${listing.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-divider hover:border-red-500/30 hover:shadow-card-hover transition-all duration-200 group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-highlight">
                      {photo ? (
                        <FallbackImage src={photo} alt={shortAddr} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/20">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{shortAddr}</p>
                      <p className="text-xs text-tertiary">{fmtPrice(listing.price, listing.listingType)} &middot; {listing.city}, {listing.state}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm">&#x1F6A9;</span>
                      <span className="text-sm font-bold text-red-400 tabular-nums">{flags}</span>
                    </div>
                    <span className="text-xs text-tertiary group-hover:text-amber transition-colors">&rarr;</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Flagged Takes */}
        <h2 className="text-sm font-extrabold tracking-[0.1em] uppercase text-red-400 mb-4">Flagged Takes</h2>
        <div className="space-y-5">
          {sortedFlagged.map((comment, idx) => {
            const reactionCounts: Record<string, number> = {};
            for (const r of comment.reactions) {
              reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
            }
            const flagCount = flagCountMap.get(comment.id) ?? 0;
            const photo = comment.listing.photos[0];
            const shortAddr = comment.listing.address.split(",")[0];
            const cred = getCredibilityTag(comment.content);

            return (
              <div key={comment.id} className="rounded-2xl bg-surface border border-divider shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-l-4 border-l-red-500">
                {/* Author row */}
                <div className="flex items-center gap-2 px-5 pt-5 pb-2">
                  <span className="text-sm">&#x1F6A9;</span>
                  <span className="text-[11px] font-extrabold text-red-400 tabular-nums">{flagCount} flag{flagCount !== 1 ? "s" : ""}</span>
                  <span className="text-tertiary/40">&middot;</span>
                  <span className="text-sm font-bold text-ink">{formatName(comment.name)}</span>
                  <span className="text-tertiary/40">&middot;</span>
                  <span className="text-xs text-tertiary">{timeAgo(comment.createdAt.toISOString())}</span>
                </div>

                {/* Credibility tag */}
                <div className="px-5 pb-3">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${cred.className}`}>
                    {cred.label}
                  </span>
                </div>

                {/* The take */}
                <div className="px-5 pb-4">
                  <p className="text-lg font-bold text-ink leading-snug">{comment.content}</p>
                </div>

                {/* Listing context */}
                <Link href={`/listing/${comment.listing.id}`} className="block group/listing px-5 pb-4">
                  <div className="relative w-full aspect-[3/1] overflow-hidden bg-highlight rounded-lg">
                    {photo ? (
                      <FallbackImage
                        src={photo}
                        alt={comment.listing.address}
                        className="w-full h-full object-cover group-hover/listing:scale-[1.03] transition-transform duration-700"
                        loading={idx < 3 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-secondary mt-2 truncate">
                    {shortAddr} &middot; {fmtPrice(comment.listing.price, comment.listing.listingType)} &middot; {comment.listing.listingType === "rent" ? "Rental" : "For Sale"}
                  </p>
                </Link>

                {/* Reactions row + CTA */}
                <div className="flex items-center justify-between px-5 pb-4 pt-1 border-t border-divider mx-5 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {["🚩", "💸", "👀", "🔥", "💀"].map((emoji) => {
                      const count = reactionCounts[emoji] || 0;
                      return (
                        <span key={emoji} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                          count > 0
                            ? "bg-highlight border-divider/60 text-ink"
                            : "bg-highlight/50 border-divider/30 text-tertiary"
                        }`}>
                          <span className="text-sm">{emoji}</span>
                          <span className="tabular-nums">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                  <Link
                    href={`/listing/${comment.listing.id}#comment-form`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber hover:underline shrink-0"
                  >
                    Add your take &rarr;
                  </Link>
                </div>
              </div>
            );
          })}

          {sortedFlagged.length === 0 && (
            <div className="text-center py-16 max-w-md mx-auto">
              <p className="font-display text-display text-ink mb-2">All clear.</p>
              <p className="text-body text-secondary mb-6">No red flags raised today — the block is quiet. If you spot something off, drop a 🚩 on the take and warn your neighbors.</p>
              <Link href="/hot-takes" className="tea-button inline-flex items-center gap-2 px-6 py-3">
                🔥 Read what&apos;s hot instead
              </Link>
            </div>
          )}

          {sortedFlagged.length > 0 && (
            <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Link href="/hot-takes" className="next-up-cta block">
                <span className="flex items-center gap-3">
                  <span aria-hidden>🔥</span>
                  <span><span className="block text-tag uppercase tracking-wider text-tea-300">Heat check</span><span className="block text-body text-ink">Today&apos;s hot takes</span></span>
                </span>
              </Link>
              <Link href="/" className="next-up-cta block">
                <span className="flex items-center gap-3">
                  <span aria-hidden>🔍</span>
                  <span><span className="block text-tag uppercase tracking-wider text-tea-300">Find a place</span><span className="block text-body text-ink">Browse listings</span></span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
