import { prisma } from "@/lib/prisma";
import FallbackImage from "@/components/FallbackImage";
import Link from "next/link";

export const metadata = {
  title: "Hot Takes | Gwaky",
  description: "The most talked-about real estate takes right now",
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

export default async function HotTakesPage() {
  // Fetch top 50 comments ordered by total reaction count
  const topCommentIds = await prisma.$queryRaw<{ id: string; reaction_count: bigint }[]>`
    SELECT c.id, COUNT(r.id) AS reaction_count
    FROM "Comment" c
    LEFT JOIN "Reaction" r ON r."commentId" = c.id
    GROUP BY c.id
    HAVING COUNT(r.id) > 0
    ORDER BY COUNT(r.id) DESC
    LIMIT 50
  `;

  const comments = topCommentIds.length > 0
    ? await prisma.comment.findMany({
        where: { id: { in: topCommentIds.map((r) => r.id) } },
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

  // Sort by reaction count to maintain order
  const reactionCountMap = new Map(topCommentIds.map((r) => [r.id, Number(r.reaction_count)]));
  const sortedComments = comments.sort(
    (a, b) => (reactionCountMap.get(b.id) ?? 0) - (reactionCountMap.get(a.id) ?? 0)
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: "radial-gradient(circle, #FF4D00, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto px-5 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors mb-4 inline-block">&larr; Back to Gwaky</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Hot Takes <span className="inline-block">&#x1F525;</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg">
            The most talked-about real estate takes right now
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="space-y-5">
          {sortedComments.map((comment, idx) => {
            const reactionCounts: Record<string, number> = {};
            for (const r of comment.reactions) {
              reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
            }
            const photo = comment.listing.photos[0];
            const shortAddr = comment.listing.address.split(",")[0];
            const cred = getCredibilityTag(comment.content);

            return (
              <div key={comment.id} className="rounded-2xl bg-surface border border-divider shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                {/* Rank + Author row */}
                <div className="flex items-center gap-2 px-5 pt-5 pb-2">
                  <span className="text-[11px] font-extrabold text-amber tabular-nums">#{idx + 1}</span>
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

          {sortedComments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl font-semibold text-ink mb-2">No takes yet</p>
              <p className="text-sm text-secondary mb-6">Be the first to drop a take on a listing.</p>
              <Link href="/" className="px-5 py-2.5 rounded-full bg-amber text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Browse listings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
