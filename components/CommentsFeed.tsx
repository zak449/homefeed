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
    <div className="space-y-2.5">
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

        return (
          <Link
            key={comment.id}
            href={`/listing/${comment.listing.id}`}
            className="group flex gap-3 p-4 rounded-2xl bg-surface border border-divider hover:border-tertiary/40 transition-all duration-200"
          >
            {/* Listing photo thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface shrink-0">
              {photo ? (
                <FallbackImage
                  src={photo}
                  alt={comment.listing.address}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tertiary/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header: name + time */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-active flex items-center justify-center">
                  <span className="text-[8px] font-bold text-ink">{initials}</span>
                </div>
                <span className="text-sm font-semibold text-ink">{comment.name}</span>
                <span className="text-xs text-tertiary">{timeAgo(comment.createdAt)}</span>
              </div>

              {/* Listing context */}
              <p className="text-[11px] text-tertiary mt-0.5 truncate">
                {price} · {comment.listing.address}, {comment.listing.city}
              </p>

              {/* Comment text */}
              <p className="text-sm text-ink mt-1.5 leading-relaxed line-clamp-2">
                {comment.content}
              </p>

              {/* Reactions */}
              {hasReactions && (
                <div className="flex items-center gap-2.5 mt-1.5">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} className="text-xs text-tertiary">
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
