"use client";

import Link from "next/link";

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
    <div>
      {comments.map((comment, idx) => {
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

        return (
          <div key={comment.id}>
            <Link
              href={`/listing/${comment.listing.id}`}
              className="group block py-6 hover:bg-surface/50 transition-colors -mx-2 px-2 rounded-card"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-avatar bg-active flex items-center justify-center text-[11px] font-semibold text-ink shrink-0">
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + time + listing ref */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-title text-ink">{comment.name}</span>
                      <span className="text-caption text-tertiary">&middot;</span>
                      <span className="text-caption text-tertiary">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <span className="text-caption text-tertiary shrink-0 group-hover:text-secondary transition-colors">
                      View listing &rsaquo;
                    </span>
                  </div>

                  {/* Listing context */}
                  <p className="text-caption text-tertiary mt-0.5 truncate">
                    on {price} &middot; {comment.listing.address}
                  </p>

                  {/* Comment text */}
                  <p className="text-body text-ink mt-2 leading-relaxed line-clamp-3">
                    &ldquo;{comment.content}&rdquo;
                  </p>

                  {/* Reactions */}
                  {hasReactions && (
                    <div className="flex items-center gap-3 mt-2">
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="text-caption text-tertiary"
                        >
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Divider */}
            {idx < comments.length - 1 && (
              <div className="border-b border-divider" />
            )}
          </div>
        );
      })}
    </div>
  );
}
