"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Credibility tag logic (mirrored from server component) ── */
function getCredibilityTag(content: string): { label: string; className: string } {
  const lower = content.toLowerCase();
  if (/\b(years?|lived here|moved|since)\b/.test(lower)) {
    const yearMatch = lower.match(/(?:since|in)\s*((?:19|20)\d{2})/);
    const year = yearMatch ? yearMatch[1] : "\u02bc09";
    return { label: `Local Since ${year}`, className: "bg-amber-900/30 text-amber-400 border border-amber-700/40" };
  }
  if (/\b(rent|tenant|lease)\b/.test(lower)) {
    return { label: "Past Renter", className: "bg-blue-900/30 text-blue-400 border border-blue-700/40" };
  }
  if (/\b(neighbor|next door|block)\b/.test(lower)) {
    return { label: "Verified Neighbor", className: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40" };
  }
  if (/\b(drive|visited|looked at)\b/.test(lower)) {
    return { label: "Drive-by Opinion", className: "bg-gray-700/40 text-gray-400 border border-gray-600/40 italic" };
  }
  return { label: "Neighbor", className: "bg-gray-700/40 text-gray-500 border border-gray-600/40" };
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
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

type SerializedReaction = {
  id: string;
  type: string;
  commentId: string;
  createdAt: string;
};

type SerializedComment = {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  reactions: SerializedReaction[];
};

interface RapSheetFeedProps {
  comments: SerializedComment[];
  reactionCounts: Record<string, number>;
  listingId: string;
}

export default function RapSheetFeed({ comments, reactionCounts, listingId }: RapSheetFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const flagCount = reactionCounts["\uD83D\uDEA9"] || 0;
  const fireCount = reactionCounts["\uD83D\uDD25"] || 0;
  const susCount = reactionCounts["\uD83D\uDE2E"] || 0;
  const skullCount = reactionCounts["\uD83D\uDC80"] || 0;
  const heartCount = reactionCounts["\u2764\uFE0F"] || 0;
  const laughCount = reactionCounts["\uD83D\uDE02"] || 0;

  // Filter comments based on activeFilter
  const filteredComments = activeFilter
    ? comments.filter((c) => c.reactions.some((r) => r.type === activeFilter))
    : comments;

  const pillBase =
    "text-caption font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all";

  function pillClasses(emoji: string | null, bg: string, borderDefault: string, text: string) {
    const isActive = activeFilter === emoji;
    const border = isActive ? "border-[#FF4D00]" : borderDefault;
    return `${pillBase} ${bg} border ${border} ${text}`;
  }

  return (
    <>
      {/* ── FILTER PILLS ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={pillClasses(null, "bg-[#1E1E1E]", "border-[#2A2A2A]", "text-[#F2F0ED]") +
            (activeFilter === null ? " border-[#FF4D00]" : "")}
        >
          {comments.length} take{comments.length !== 1 ? "s" : ""} total
        </button>
        {flagCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\uD83D\uDEA9" ? null : "\uD83D\uDEA9")}
            className={pillClasses("\uD83D\uDEA9", "bg-red-950/50", "border-red-800/30", "text-red-400")}
          >
            {flagCount} red flag{flagCount !== 1 ? "s" : ""}
          </button>
        )}
        {fireCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\uD83D\uDD25" ? null : "\uD83D\uDD25")}
            className={pillClasses("\uD83D\uDD25", "bg-orange-950/50", "border-orange-800/30", "text-orange-400")}
          >
            {fireCount} fire{fireCount !== 1 ? "s" : ""}
          </button>
        )}
        {susCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\uD83D\uDE2E" ? null : "\uD83D\uDE2E")}
            className={pillClasses("\uD83D\uDE2E", "bg-yellow-950/50", "border-yellow-800/30", "text-yellow-400")}
          >
            {susCount} sus
          </button>
        )}
        {skullCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\uD83D\uDC80" ? null : "\uD83D\uDC80")}
            className={pillClasses("\uD83D\uDC80", "bg-purple-950/50", "border-purple-800/30", "text-purple-400")}
          >
            {skullCount} dead
          </button>
        )}
        {heartCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\u2764\uFE0F" ? null : "\u2764\uFE0F")}
            className={pillClasses("\u2764\uFE0F", "bg-pink-950/50", "border-pink-800/30", "text-pink-400")}
          >
            {heartCount} love{heartCount !== 1 ? "s" : ""}
          </button>
        )}
        {laughCount > 0 && (
          <button
            onClick={() => setActiveFilter(activeFilter === "\uD83D\uDE02" ? null : "\uD83D\uDE02")}
            className={pillClasses("\uD83D\uDE02", "bg-emerald-950/50", "border-emerald-800/30", "text-emerald-400")}
          >
            {laughCount} lol{laughCount !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* ── TAKES LIST ── */}
      <div className="py-8">
        <h2 className="font-display text-[1.5rem] sm:text-[1.75rem] font-extrabold tracking-tight mb-1">
          {activeFilter ? "Filtered Takes" : "All Takes"}
        </h2>
        <p className="text-[#9A9A9A] text-caption mb-6">
          {activeFilter
            ? `${filteredComments.length} take${filteredComments.length !== 1 ? "s" : ""} with this reaction`
            : "Sorted by most reactions first"}
        </p>

        {filteredComments.length === 0 ? (
          <div className="text-center py-12 text-[#666666]">
            {activeFilter ? (
              <p className="text-body">No takes with this reaction.</p>
            ) : (
              <>
                <p className="text-body">No takes yet. Be the first to drop one.</p>
                <Link
                  href={`/listing/${listingId}`}
                  className="inline-block mt-4 text-caption font-semibold text-[#D4763C] hover:text-[#D4763C]/80 transition-colors"
                >
                  Go to listing &rarr;
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment, i) => {
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
    </>
  );
}
