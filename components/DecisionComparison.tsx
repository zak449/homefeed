"use client";

import { useState, useEffect } from "react";

interface DecisionComparisonProps {
  listing: {
    description?: string;
    price: number;
    address: string;
  };
  commentCount: number;
  topComments: { content: string; name: string }[];
}

export default function DecisionComparison({
  listing,
  commentCount,
  topComments,
}: DecisionComparisonProps) {
  const [truthMeter, setTruthMeter] = useState(0);
  const [hiddenFacts, setHiddenFacts] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Deterministic "random" based on address for consistent demo results
    const seed = listing.address
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const meter = 40 + (seed % 31); // 40-70 range
    const facts = 2 + (seed % 5); // 2-6 range
    setTruthMeter(meter);
    setHiddenFacts(facts);

    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [listing.address]);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  }

  const meterColor =
    truthMeter >= 60
      ? "from-emerald-500 to-emerald-400"
      : truthMeter >= 50
        ? "from-amber to-yellow-500"
        : "from-red-400 to-amber";

  const meterLabel =
    truthMeter >= 60
      ? "Mostly aligned"
      : truthMeter >= 50
        ? "Some discrepancies"
        : "Notable gaps";

  return (
    <div className="bg-surface rounded-card border border-divider shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ink to-ink/70 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="font-display text-title text-ink tracking-tight">Decision Intel</h3>
        </div>
        <p className="text-caption text-secondary ml-8">
          Compare what the listing says vs. what the community reports
        </p>
      </div>

      {/* Truth Meter */}
      <div className="mx-5 mb-4 p-4 bg-highlight rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-tertiary">
            Truth Meter
          </span>
          <span className="text-caption font-semibold text-ink">
            {animated ? truthMeter : 0}% alignment
          </span>
        </div>
        <div className="w-full h-2.5 bg-divider rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${meterColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: animated ? `${truthMeter}%` : "0%" }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-tertiary">{meterLabel}</span>
          <span className="text-[11px] text-amber font-medium">
            {hiddenFacts} hidden facts surfaced
          </span>
        </div>
      </div>

      {/* Side by side */}
      <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Listing column */}
        <div className="bg-surface rounded-xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-highlight flex items-center justify-center">
              <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h4 className="text-caption font-semibold text-ink">What the listing says</h4>
          </div>

          {/* Price */}
          <div className="mb-3 pb-3 border-b border-divider">
            <p className="text-[11px] text-tertiary uppercase tracking-wider mb-1">Asking Price</p>
            <p className="text-headline text-ink">{formatPrice(listing.price)}</p>
          </div>

          {/* Description */}
          {listing.description ? (
            <div className="mb-3">
              <p className="text-[11px] text-tertiary uppercase tracking-wider mb-1">Agent Description</p>
              <p className="text-caption text-secondary leading-relaxed line-clamp-4">
                {listing.description}
              </p>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-caption text-tertiary italic">No description provided</p>
            </div>
          )}

          {/* Mock specs */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-tertiary uppercase tracking-wider mb-1">Official Specs</p>
            {["Updated kitchen", "Quiet neighborhood", "Move-in ready", "Great schools nearby"].map(
              (spec) => (
                <div key={spec} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-caption text-secondary">{spec}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Community column */}
        <div className="bg-amber/[0.04] rounded-xl border border-amber/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-amber/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h4 className="text-caption font-semibold text-ink">What the community says</h4>
            <span className="ml-auto text-[10px] font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
              {commentCount} opinions
            </span>
          </div>

          {/* Community sentiment */}
          <div className="mb-3 pb-3 border-b border-amber/10">
            <p className="text-[11px] text-tertiary uppercase tracking-wider mb-2">Community Sentiment</p>
            <div className="flex items-center gap-3">
              {[
                { emoji: "🔥", label: "Hot take", count: Math.ceil(commentCount * 0.3) },
                { emoji: "⚠️", label: "Concerns", count: Math.ceil(commentCount * 0.2) },
                { emoji: "💡", label: "Insights", count: Math.ceil(commentCount * 0.5) },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 bg-surface/80 px-2.5 py-1.5 rounded-lg">
                  <span className="text-sm">{s.emoji}</span>
                  <div>
                    <p className="text-[10px] font-medium text-ink">{s.count}</p>
                    <p className="text-[9px] text-tertiary">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top comments */}
          <div className="space-y-2.5">
            <p className="text-[11px] text-tertiary uppercase tracking-wider">Neighbor Takes</p>
            {topComments.length > 0 ? (
              topComments.slice(0, 3).map((comment, i) => (
                <div key={i} className="bg-surface/80 rounded-lg p-3">
                  <p className="text-caption text-ink leading-relaxed line-clamp-2">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <p className="text-[11px] text-tertiary mt-1.5 font-medium">
                    &mdash; {comment.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-surface/80 rounded-lg p-3">
                <p className="text-caption text-tertiary italic">
                  No community feedback yet. Be the first to share.
                </p>
              </div>
            )}
          </div>

          {/* Reported issues */}
          <div className="mt-3 pt-3 border-t border-amber/10">
            <p className="text-[11px] text-tertiary uppercase tracking-wider mb-2">Reported Issues</p>
            <div className="space-y-1.5">
              {["Street noise on weekends", "Parking can be tight", "HOA fee increase pending"].map(
                (issue) => (
                  <div key={issue} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-caption text-secondary">{issue}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-highlight/50 border-t border-divider flex items-center justify-between">
        <p className="text-[11px] text-tertiary">
          Based on {commentCount} community opinions for {listing.address}
        </p>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-amber">
          Community Intel
        </span>
      </div>
    </div>
  );
}
