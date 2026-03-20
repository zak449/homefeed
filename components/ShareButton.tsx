"use client";

import { useState } from "react";

interface ShareButtonProps {
  listingId: string;
  address: string;
  city: string;
  price: string;
}

export default function ShareButton({ listingId, address, city, price }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/listing/${listingId}`
    : `/listing/${listingId}`;

  const shareText = `Check out what people are saying about this listing on homefeed — ${price} at ${address}, ${city}`;

  async function handleShare() {
    // Try native Web Share API first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${price} — ${address}`,
          text: shareText,
          url,
        });
        return;
      } catch (err: any) {
        // User cancelled or share failed — fall through to clipboard
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Final fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText}\n${url}`;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
        aria-label="Share listing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share</span>
      </button>

      {/* Toast */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-modal animate-fade-in">
          Link copied!
        </div>
      )}
    </div>
  );
}
