"use client";

import { useState } from "react";

export default function VoteButtons() {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [score, setScore] = useState(0);

  function handleUp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (vote === "up") {
      setVote(null);
      setScore((s) => s - 1);
    } else {
      setScore((s) => s + (vote === "down" ? 2 : 1));
      setVote("up");
    }
  }

  function handleDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (vote === "down") {
      setVote(null);
      setScore((s) => s + 1);
    } else {
      setScore((s) => s - (vote === "up" ? 2 : 1));
      setVote("down");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleUp}
        className={`p-1 rounded-md transition-colors ${
          vote === "up"
            ? "text-amber bg-amber/10"
            : "text-tertiary hover:text-ink hover:bg-highlight"
        }`}
        title="Upvote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <span className={`text-xs font-bold tabular-nums min-w-[1.25rem] text-center ${
        vote === "up" ? "text-amber" : vote === "down" ? "text-tertiary" : "text-secondary"
      }`}>
        {score}
      </span>
      <button
        onClick={handleDown}
        className={`p-1 rounded-md transition-colors ${
          vote === "down"
            ? "text-tertiary bg-highlight"
            : "text-tertiary hover:text-ink hover:bg-highlight"
        }`}
        title="Downvote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
