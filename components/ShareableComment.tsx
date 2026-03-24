"use client";

import { useState, useRef } from "react";

type ShareableCommentProps = {
  name: string;
  content: string;
  createdAt: string;
  address: string;
  price: string;
  reactions?: Record<string, number>;
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export default function ShareableComment({
  name,
  content,
  createdAt,
  address,
  price,
  reactions = {},
}: ShareableCommentProps) {
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const topReaction = Object.entries(reactions).sort((a, b) => b[1] - a[1])[0];

  async function handleShare() {
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Take on ${address}`,
          text: `"${content}" — ${name} on Gwaky\n\n${address} · ${price}`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or API unavailable, fall through to card
      }
    }
    setShowCard(true);
  }

  async function handleCopyText() {
    const text = `"${content}"\n\n— ${name} on ${address} (${price})\nGwaky`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="relative">
      {/* Share trigger button */}
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1 text-[11px] text-muted/50 hover:text-social transition-colors mt-1"
        title="Share this take"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share this take
      </button>

      {/* Shareable card overlay */}
      {showCard && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCard(false)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {/* The card */}
            <div
              ref={cardRef}
              className="bg-white rounded-2xl overflow-hidden shadow-modal"
            >
              {/* Gradient header */}
              <div className="bg-gradient-to-br from-[#0F0F0F] to-[#1a1a1a] px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-social flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-white/70">Gwaky</span>
                </div>
                <p className="text-white text-sm leading-relaxed font-medium">
                  &ldquo;{content}&rdquo;
                </p>
              </div>

              {/* Author + listing info */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-semibold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="text-[11px] text-muted">{timeAgo(createdAt)}</p>
                  </div>
                  {totalReactions > 0 && topReaction && (
                    <span className="ml-auto text-xs bg-tag px-2 py-0.5 rounded-full">
                      {topReaction[0]} {totalReactions}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-tag rounded-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{address}</p>
                    <p className="text-[11px] text-muted">{price}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions below card */}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex-1 py-2.5 bg-white rounded-xl text-sm font-semibold text-ink hover:bg-tag transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-money" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy text
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCard(false)}
                className="py-2.5 px-4 bg-white/80 rounded-xl text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
