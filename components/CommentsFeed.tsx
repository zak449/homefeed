"use client";

import { useState } from "react";
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

function TakeCard({ comment }: { comment: CommentFeedItem }) {
  const [expanded, setExpanded] = useState(false);

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
      href={`/listing/${comment.listing.id}`}
      className="group block bg-[#FFFFFF] border border-[#E8E6E3] rounded-xl overflow-hidden hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300"
    >
      {/* 1. Property photo — full width, 4/3 aspect, the hook */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {photo ? (
          <FallbackImage
            src={photo}
            alt={comment.listing.address}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#D4763C]/20 via-[#F5F3F0] to-[#D4763C]/10 flex items-center justify-center">
            <div className="text-center px-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto text-[#D4763C]/40 mb-2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <p className="text-sm font-medium text-[#6B6B6B]">
                {comment.listing.address}
              </p>
            </div>
          </div>
        )}

        {/* 2a. Listing type badge — top right of photo */}
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white border border-white/10">
            {isRent ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* 2b. Price + location overlay — bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3.5 pt-10">
          <p className="text-lg font-bold text-white leading-tight">{price}</p>
          <p className="text-[13px] text-white/70 mt-0.5 truncate">
            {comment.listing.address}, {comment.listing.city}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pt-3.5 pb-4">
        {/* 3. Author row */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#D4763C] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white leading-none">{initials}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[14px] font-semibold text-[#1A1A1A] truncate">
              {comment.name}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.41 5.41L7 9.83 4.59 7.41 3.17 8.83 7 12.66l5.83-5.83-1.42-1.42z" />
              </svg>
              Verified local
            </span>
            <span className="text-[12px] text-[#999999] shrink-0">{timeAgo(comment.createdAt)}</span>
          </div>
        </div>

        {/* 4. The take — hero text */}
        <div className="mb-3">
          <p
            className={`text-[15px] text-[#1A1A1A] leading-[1.55] ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            &ldquo;{comment.content}&rdquo;
          </p>
          {!expanded && comment.content.length > 140 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(true);
              }}
              className="text-[13px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A] mt-1 transition-colors"
            >
              Read more
            </button>
          )}
        </div>

        {/* 5. Reactions row — emoji pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 -mb-0.5">
          {hasReactions ? (
            Object.entries(reactionCounts).map(([emoji, count]) => (
              <span
                key={emoji}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#F5F3F0] border border-[#E8E6E3] text-[#1A1A1A] shrink-0 hover:border-[#D4763C]/30 transition-colors cursor-pointer"
              >
                <span className="text-sm leading-none">{emoji}</span>
                <span className="font-medium text-[12px]">{count}</span>
              </span>
            ))
          ) : (
            <span className="text-[13px] text-[#999999]">Be the first to react</span>
          )}
        </div>

        {/* 6. Action row — CTA */}
        <div className="flex items-center justify-end pt-3 border-t border-[#E8E6E3]/70">
          <span className="text-[13px] font-semibold text-[#D4763C] group-hover:translate-x-0.5 transition-transform duration-200">
            {totalReactions > 0
              ? `See ${totalReactions} more takes`
              : "Join the conversation"}{" "}
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CommentsFeed({ comments }: { comments: CommentFeedItem[] }) {
  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {comments.map((comment) => (
        <TakeCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
