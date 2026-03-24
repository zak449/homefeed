"use client";

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

export type CommentFeedItem = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  reactions: { type: string }[];
  listing: {
    id: string;
    address: string;
    city: string;
    state: string;
    price: number;
    photos: string[];
    listingType: string;
  };
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function aggregateReactions(reactions: { type: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}

export default function CommentsFeed({ comments }: { comments: CommentFeedItem[] }) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const initials = comment.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const isRent = comment.listing.listingType === "rent";
        const price = isRent
          ? `$${comment.listing.price.toLocaleString()}/mo`
          : `$${comment.listing.price.toLocaleString()}`;
        const reactionCounts = aggregateReactions(comment.reactions);
        const hasReactions = comment.reactions.length > 0;
        const photo = comment.listing.photos[0];
        const totalReactions = comment.reactions.length;

        return (
          <Link
            key={comment.id}
            href={`/listing/${comment.listing.id}`}
            className="group block rounded-2xl bg-surface border border-divider hover:border-amber/30 hover:shadow-soft transition-all duration-200 overflow-hidden"
          >
            {/* Property photo — big and prominent */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden bg-highlight">
              {photo ? (
                <FallbackImage
                  src={photo}
                  alt={comment.listing.address}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tertiary/20 bg-highlight">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}
              {/* Property info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-white leading-none">{price}</p>
                    <p className="text-xs sm:text-sm text-white/80 mt-0.5 truncate max-w-[260px]">
                      {comment.listing.address}, {comment.listing.city}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                    {isRent ? "Rental" : "For Sale"}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment body — the hero */}
            <div className="p-4 sm:p-5">
              {/* Author row */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber">{initials}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-ink truncate">{comment.name}</span>
                  <span className="text-[11px] text-tertiary shrink-0">{timeAgo(comment.createdAt)}</span>
                </div>
              </div>

              {/* Comment text — big and readable */}
              <p className="text-[15px] sm:text-base text-ink leading-relaxed line-clamp-3 mb-3">
                &ldquo;{comment.content}&rdquo;
              </p>

              {/* Bottom row: reactions + CTA */}
              <div className="flex items-center justify-between pt-2.5 border-t border-divider/60">
                {/* Reactions — colorful and tappable */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {hasReactions ? (
                    Object.entries(reactionCounts).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-highlight border border-divider/60 text-ink hover:border-amber/30 transition-colors"
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className="font-medium">{count}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-tertiary">Be the first to react</span>
                  )}
                </div>

                {/* CTA */}
                <span className="text-xs font-semibold text-amber group-hover:underline shrink-0 ml-2">
                  {totalReactions > 0
                    ? `See ${totalReactions} more takes`
                    : "Join the conversation"}{" "}
                  &rarr;
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
