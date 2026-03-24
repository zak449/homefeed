import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FallbackImage from "@/components/FallbackImage";
import CopyLinkButton from "@/components/CopyLinkButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { address: true, city: true, state: true },
  });
  if (!listing) return {};

  const commentCount = await prisma.comment.count({ where: { listingId: id } });
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state}`;

  return {
    title: `Rap Sheet: ${fullAddress} — Gwaky`,
    description: `${commentCount} takes from the community on ${fullAddress}. See what neighbors are really saying on Gwaky.`,
    openGraph: {
      title: `Rap Sheet: ${fullAddress} — Gwaky`,
      description: `${commentCount} takes from the community on ${fullAddress}.`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Rap Sheet: ${fullAddress} — Gwaky`,
      description: `${commentCount} takes from the community on ${fullAddress}.`,
    },
  };
}

/* ── Credibility tag logic (mirrored from CommentSection) ── */
function getCredibilityTag(content: string): { label: string; className: string } {
  const lower = content.toLowerCase();
  if (/\b(years?|lived here|moved|since)\b/.test(lower)) {
    const yearMatch = lower.match(/(?:since|in)\s*((?:19|20)\d{2})/);
    const year = yearMatch ? yearMatch[1] : "\u02bc09";
    return { label: `Local Since ${year}`, className: "bg-amber-100 text-amber-800 border border-amber-200" };
  }
  if (/\b(rent|tenant|lease)\b/.test(lower)) {
    return { label: "Past Renter", className: "bg-blue-100 text-blue-800 border border-blue-200" };
  }
  if (/\b(neighbor|next door|block)\b/.test(lower)) {
    return { label: "Verified Neighbor", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" };
  }
  if (/\b(drive|visited|looked at)\b/.test(lower)) {
    return { label: "Drive-by Opinion", className: "bg-gray-100 text-gray-500 border border-gray-200 italic" };
  }
  return { label: "Neighbor", className: "bg-gray-100 text-gray-600 border border-gray-200" };
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function RapSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [listing, comments, reactions] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.findMany({
      where: { listingId: id },
      include: {
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reaction.findMany({
      where: { comment: { listingId: id } },
    }),
  ]);

  if (!listing) notFound();

  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  const photo = listing.photos[0] ?? null;

  // ── Reaction tallies ──
  const reactionCounts: Record<string, number> = {};
  for (const r of reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  }
  const flagCount = reactionCounts["\uD83D\uDEA9"] || 0; // red flag emoji
  const fireCount = reactionCounts["\uD83D\uDD25"] || 0; // fire emoji
  const susCount = reactionCounts["\uD83D\uDE2E"] || 0;  // shocked face
  const skullCount = reactionCounts["\uD83D\uDC80"] || 0; // skull
  const heartCount = reactionCounts["\u2764\uFE0F"] || 0;
  const laughCount = reactionCounts["\uD83D\uDE02"] || 0;
  const totalVibeVotes = flagCount + fireCount;

  // Sort comments by most reactions first
  const sortedComments = [...comments].sort(
    (a, b) => b.reactions.length - a.reactions.length
  );

  // Unique commenter count
  const uniqueCommenters = new Set(comments.map((c) => c.email)).size;

  const shareText = encodeURIComponent(
    `Look what neighbors are saying about ${listing.address} on Gwaky \uD83D\uDC40`
  );
  const shareUrl = encodeURIComponent(
    `https://gwaky.com/rap-sheet/${id}`
  );

  return (
    <div className="min-h-screen bg-[#111111] text-[#F2F0ED]">

      {/* ══ HERO HEADER ══ */}
      <div className="relative w-full min-h-[340px] sm:min-h-[420px] overflow-hidden">
        {/* Background photo */}
        {photo && (
          <div className="absolute inset-0">
            <FallbackImage
              src={photo}
              alt={listing.address}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-[#111111]/40" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-10 flex flex-col justify-end min-h-[340px] sm:min-h-[420px]">
          {/* Back link */}
          <Link
            href={`/listing/${id}`}
            className="text-caption text-white/50 hover:text-white/80 transition-colors mb-auto flex items-center gap-1.5 w-fit"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to listing
          </Link>

          {/* Badge */}
          <div className="mb-4">
            <span className="inline-block bg-[#D4763C] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Property Rap Sheet
            </span>
          </div>

          {/* Address */}
          <h1 className="font-display text-[2.5rem] sm:text-[3.5rem] leading-[1.05] tracking-[-0.04em] font-extrabold text-white">
            {listing.address}
          </h1>
          <p className="text-[1rem] sm:text-[1.125rem] text-white/60 mt-1.5">
            {listing.city}, {listing.state} {listing.zip}
          </p>
          <p className="font-display text-[2rem] sm:text-[2.5rem] font-extrabold text-white mt-2 tracking-tight">
            {price}
          </p>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ── COMMUNITY VERDICT ── */}
        <div className="py-8 border-b border-[#2A2A2A]">
          <h2 className="font-display text-[1.75rem] sm:text-[2rem] font-extrabold tracking-tight mb-1">
            Community Verdict
          </h2>
          <p className="text-[#9A9A9A] text-body mb-6">
            {uniqueCommenters} neighbor{uniqueCommenters !== 1 ? "s" : ""} ha{uniqueCommenters !== 1 ? "ve" : "s"} spoken
          </p>

          {/* Vibe bar */}
          {totalVibeVotes > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-caption font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{"\uD83D\uDEA9"}</span>
                  <span className="text-red-400">{flagCount} red flag{flagCount !== 1 ? "s" : ""}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-orange-400">{fireCount} fire{fireCount !== 1 ? "s" : ""}</span>
                  <span className="text-base">{"\uD83D\uDD25"}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-[#2A2A2A] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${(flagCount / totalVibeVotes) * 100}%` }}
                />
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(fireCount / totalVibeVotes) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-caption font-semibold bg-[#1E1E1E] border border-[#2A2A2A] px-3 py-1.5 rounded-full">
              {comments.length} take{comments.length !== 1 ? "s" : ""} total
            </span>
            {flagCount > 0 && (
              <span className="text-caption font-semibold bg-red-950/50 border border-red-800/30 text-red-400 px-3 py-1.5 rounded-full">
                {flagCount} red flag{flagCount !== 1 ? "s" : ""}
              </span>
            )}
            {fireCount > 0 && (
              <span className="text-caption font-semibold bg-orange-950/50 border border-orange-800/30 text-orange-400 px-3 py-1.5 rounded-full">
                {fireCount} fire{fireCount !== 1 ? "s" : ""}
              </span>
            )}
            {susCount > 0 && (
              <span className="text-caption font-semibold bg-yellow-950/50 border border-yellow-800/30 text-yellow-400 px-3 py-1.5 rounded-full">
                {susCount} sus
              </span>
            )}
            {skullCount > 0 && (
              <span className="text-caption font-semibold bg-purple-950/50 border border-purple-800/30 text-purple-400 px-3 py-1.5 rounded-full">
                {skullCount} dead
              </span>
            )}
            {heartCount > 0 && (
              <span className="text-caption font-semibold bg-pink-950/50 border border-pink-800/30 text-pink-400 px-3 py-1.5 rounded-full">
                {heartCount} love{heartCount !== 1 ? "s" : ""}
              </span>
            )}
            {laughCount > 0 && (
              <span className="text-caption font-semibold bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 px-3 py-1.5 rounded-full">
                {laughCount} lol{laughCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* ── ALL TAKES ── */}
        <div className="py-8">
          <h2 className="font-display text-[1.5rem] sm:text-[1.75rem] font-extrabold tracking-tight mb-1">
            All Takes
          </h2>
          <p className="text-[#9A9A9A] text-caption mb-6">
            Sorted by most reactions first
          </p>

          {sortedComments.length === 0 ? (
            <div className="text-center py-12 text-[#666666]">
              <p className="text-body">No takes yet. Be the first to drop one.</p>
              <Link
                href={`/listing/${id}`}
                className="inline-block mt-4 text-caption font-semibold text-[#D4763C] hover:text-[#D4763C]/80 transition-colors"
              >
                Go to listing &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map((comment, i) => {
                const tag = getCredibilityTag(comment.content);
                const initials = comment.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                // Group reactions by type
                const rxCounts: Record<string, number> = {};
                for (const rx of comment.reactions) {
                  rxCounts[rx.type] = (rxCounts[rx.type] || 0) + 1;
                }

                return (
                  <div
                    key={comment.id}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-5 fade-up"
                    style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#252525] flex items-center justify-center text-[11px] font-semibold text-[#F2F0ED] shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-title text-[#F2F0ED] font-semibold">{comment.name}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tag.className}`}>
                            {tag.label}
                          </span>
                        </div>
                        <span className="text-caption text-[#666666]">{timeAgo(comment.createdAt)}</span>
                      </div>
                    </div>

                    {/* Comment text */}
                    <p className="text-[0.9375rem] text-[#F2F0ED] leading-relaxed whitespace-pre-wrap mb-3">
                      {comment.content}
                    </p>

                    {/* Reactions */}
                    {Object.keys(rxCounts).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(rxCounts).map(([type, count]) => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 text-caption bg-[#252525] border border-[#2A2A2A] px-2.5 py-1 rounded-full"
                          >
                            <span className="text-sm">{type}</span>
                            <span className="text-[#9A9A9A] font-medium">{count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SHARE SECTION ── */}
        <div className="py-8 border-t border-[#2A2A2A]">
          <h2 className="font-display text-[1.5rem] font-extrabold tracking-tight mb-1">
            Share this rap sheet
          </h2>
          <p className="text-[#9A9A9A] text-caption mb-5">
            Let people know what the community thinks
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#F2F0ED]/20 hover:shadow-soft text-[#F2F0ED] text-caption font-semibold px-4 py-2.5 rounded-full transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Post on X
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#F2F0ED]/20 hover:shadow-soft text-[#F2F0ED] text-caption font-semibold px-4 py-2.5 rounded-full transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </a>

            {/* Copy Link — client component not needed; just link to self */}
            <CopyLinkButton url={`https://gwaky.com/rap-sheet/${id}`} />
          </div>
        </div>

        {/* CTA back to listing */}
        <div className="py-8 border-t border-[#2A2A2A] text-center">
          <Link
            href={`/listing/${id}`}
            className="inline-flex items-center gap-2 bg-[#D4763C] hover:bg-[#D4763C]/90 text-white font-semibold text-body px-6 py-3 rounded-full transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to listing
          </Link>
        </div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}

