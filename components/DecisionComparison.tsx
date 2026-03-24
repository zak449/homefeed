"use client";

import { useMemo } from "react";

interface Comment {
  name: string;
  content: string;
  createdAt: string;
}

interface DecisionComparisonProps {
  comments: Comment[];
  description: string | null;
  address: string;
  commentCount: number;
}

type Sentiment = "warning" | "positive" | "neutral";

const WARNING_KEYWORDS = [
  "flood",
  "mold",
  "noise",
  "loud",
  "smell",
  "pest",
  "roach",
  "rat",
  "mice",
  "leak",
  "crack",
  "damage",
  "danger",
  "unsafe",
  "crime",
  "theft",
  "break-in",
  "broken",
  "avoid",
  "worst",
  "terrible",
  "horrible",
  "dirty",
  "trash",
  "pollution",
  "construction",
  "parking",
  "traffic",
  "HOA",
  "expensive",
  "overpriced",
  "issue",
  "problem",
  "complain",
  "bug",
  "infest",
];

const POSITIVE_KEYWORDS = [
  "love",
  "great",
  "best",
  "amazing",
  "beautiful",
  "quiet",
  "safe",
  "friendly",
  "clean",
  "wonderful",
  "excellent",
  "perfect",
  "nice",
  "lovely",
  "charming",
  "peaceful",
  "spacious",
  "renovated",
  "updated",
  "modern",
  "good",
  "fantastic",
  "awesome",
  "recommend",
  "walkable",
  "convenient",
  "family",
  "community",
];

function classifySentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  let warningScore = 0;
  let positiveScore = 0;

  for (const word of WARNING_KEYWORDS) {
    if (lower.includes(word)) warningScore++;
  }
  for (const word of POSITIVE_KEYWORDS) {
    if (lower.includes(word)) positiveScore++;
  }

  if (warningScore > positiveScore) return "warning";
  if (positiveScore > warningScore) return "positive";
  return "neutral";
}

function sentimentBadge(sentiment: Sentiment) {
  switch (sentiment) {
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Heads up
        </span>
      );
    case "positive":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Positive
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-surface text-tertiary px-2 py-0.5 rounded-full">
          Neutral
        </span>
      );
  }
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function DecisionComparison({
  comments,
  description,
  address,
  commentCount,
}: DecisionComparisonProps) {
  const analysis = useMemo(() => {
    if (comments.length === 0) return null;

    const classified = comments.map((c) => ({
      ...c,
      sentiment: classifySentiment(c.content),
    }));

    const warningCount = classified.filter((c) => c.sentiment === "warning").length;
    const positiveCount = classified.filter((c) => c.sentiment === "positive").length;
    const neutralCount = classified.filter((c) => c.sentiment === "neutral").length;

    const sorted = [...classified].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecent = sorted[0];
    const displayComments = sorted.slice(0, 5);

    return {
      warningCount,
      positiveCount,
      neutralCount,
      mostRecent,
      displayComments,
    };
  }, [comments]);

  // Empty state
  if (comments.length === 0) {
    return (
      <div className="bg-surface rounded-card border border-divider shadow-soft overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ink to-ink/70 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="font-display text-title text-ink tracking-tight">Neighbor Intel</h3>
          </div>
        </div>
        <div className="px-5 pb-6">
          <div className="bg-highlight rounded-xl p-6 text-center">
            <p className="text-caption text-secondary">
              No neighbor intel yet — be the first to share what you know
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-divider shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ink to-ink/70 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="font-display text-title text-ink tracking-tight">Neighbor Intel</h3>
        </div>
        <p className="text-caption text-secondary ml-8">
          Real takes from the community on this listing
        </p>
      </div>

      {/* Community Pulse */}
      <div className="mx-5 mb-4 p-4 bg-highlight rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-tertiary">
            Community Pulse
          </span>
          <span className="text-caption font-semibold text-ink">
            {commentCount} neighbor {commentCount === 1 ? "take" : "takes"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {analysis!.positiveCount > 0 && (
            <div className="flex items-center gap-1.5 bg-surface/80 px-2.5 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-[10px] font-medium text-ink">{analysis!.positiveCount}</p>
                <p className="text-[9px] text-tertiary">Positive</p>
              </div>
            </div>
          )}
          {analysis!.warningCount > 0 && (
            <div className="flex items-center gap-1.5 bg-surface/80 px-2.5 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-[10px] font-medium text-ink">{analysis!.warningCount}</p>
                <p className="text-[9px] text-tertiary">Heads up</p>
              </div>
            </div>
          )}
          {analysis!.neutralCount > 0 && (
            <div className="flex items-center gap-1.5 bg-surface/80 px-2.5 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[10px] font-medium text-ink">{analysis!.neutralCount}</p>
                <p className="text-[9px] text-tertiary">Neutral</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Listing vs Neighbor Reality */}
      <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Listing description side */}
        <div className="bg-surface rounded-xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-highlight flex items-center justify-center">
              <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h4 className="text-caption font-semibold text-ink">Listing Description</h4>
          </div>
          {description ? (
            <p className="text-caption text-secondary leading-relaxed line-clamp-6">
              {description}
            </p>
          ) : (
            <p className="text-caption text-tertiary italic">
              No description provided
            </p>
          )}
        </div>

        {/* Neighbor reality side */}
        <div className="bg-amber/[0.04] rounded-xl border border-amber/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-amber/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h4 className="text-caption font-semibold text-ink">Neighbor Reality</h4>
          </div>
          <div className="bg-surface/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-tertiary font-medium">Most recent take</p>
              {sentimentBadge(analysis!.mostRecent.sentiment)}
            </div>
            <p className="text-caption text-ink leading-relaxed line-clamp-4">
              &ldquo;{analysis!.mostRecent.content}&rdquo;
            </p>
            <p className="text-[11px] text-tertiary mt-1.5">
              &mdash; {analysis!.mostRecent.name} &middot; {formatRelativeDate(analysis!.mostRecent.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Neighbor Takes */}
      <div className="px-5 pb-5">
        <p className="text-[11px] text-tertiary uppercase tracking-wider mb-2.5">Neighbor Takes</p>
        <div className="space-y-2.5">
          {analysis!.displayComments.map((comment, i) => (
            <div key={i} className="bg-highlight/50 rounded-lg p-3 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {sentimentBadge(comment.sentiment)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-caption text-ink leading-relaxed line-clamp-2">
                  &ldquo;{comment.content}&rdquo;
                </p>
                <p className="text-[11px] text-tertiary mt-1">
                  &mdash; {comment.name} &middot; {formatRelativeDate(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-highlight/50 border-t border-divider flex items-center justify-between">
        <p className="text-[11px] text-tertiary">
          Based on {commentCount} real {commentCount === 1 ? "opinion" : "opinions"} for {address}
        </p>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-amber">
          Community Intel
        </span>
      </div>
    </div>
  );
}
