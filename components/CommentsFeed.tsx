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

function getAvatarColor(name: string): string {
  const colors = [
    "bg-neutral-900",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-neutral-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function getAvatarBorderColor(name: string): string {
  const colors = [
    "border-l-neutral-900",
    "border-l-blue-600",
    "border-l-emerald-600",
    "border-l-violet-600",
    "border-l-amber-600",
    "border-l-rose-600",
    "border-l-cyan-600",
    "border-l-neutral-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
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
    <div className="space-y-0">
      {comments.map((comment, idx) => {
        const initials = comment.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const avatarColor = getAvatarColor(comment.name);
        const borderColor = getAvatarBorderColor(comment.name);
        const photo = comment.listing.photos[0];
        const isRent = comment.listing.listingType === "rent";
        const price = isRent
          ? `$${comment.listing.price.toLocaleString()}/mo`
          : `$${comment.listing.price.toLocaleString()}`;
        const reactionCounts = aggregateReactions(comment.reactions);
        const hasReactions = comment.reactions.length > 0;

        return (
          <Link
            key={comment.id}
            href={`/listing/${comment.listing.id}`}
            className={`group block comment-feed-card bg-white border border-border rounded-xl px-4 py-4 sm:px-5 sm:py-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 border-l-[3px] ${borderColor} ${idx > 0 ? "mt-3" : ""}`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Left: avatar + content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0 ${avatarColor}`}
                  >
                    {initials}
                  </div>
                  {/* Name + context */}
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-semibold text-sm text-ink">{comment.name}</span>
                    <span className="text-xs text-muted/50">&middot;</span>
                    <span className="text-xs text-muted/50">{timeAgo(comment.createdAt)}</span>
                    <span className="text-xs text-muted/50">&middot;</span>
                    <span className="text-xs text-muted truncate">
                      on{" "}
                      <span className="font-medium text-ink/70">
                        {comment.listing.address}, {comment.listing.city}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Comment text */}
                <p className="text-base font-medium text-ink mt-2 leading-relaxed line-clamp-3">
                  &ldquo;{comment.content}&rdquo;
                </p>

                {/* Reaction bar + CTA */}
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  {hasReactions && (
                    <div className="flex items-center gap-1.5">
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-0.5 text-xs bg-tag px-2 py-0.5 rounded-full text-ink font-semibold"
                        >
                          <span className="text-[13px]">{emoji}</span>
                          {count}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-social group-hover:underline ml-auto">
                    View listing & conversation &rarr;
                  </span>
                </div>
              </div>

              {/* Right: listing thumbnail */}
              {photo && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-tag shrink-0 mt-1">
                  <FallbackImage
                    src={photo}
                    alt={comment.listing.address}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
