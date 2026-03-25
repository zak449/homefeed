"use client";

import { useState } from "react";

export default function ExpandableText({
  text,
  maxLength = 200,
}: {
  text: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;

  if (!needsTruncation) {
    return <p className="text-body text-secondary leading-relaxed">{text}</p>;
  }

  return (
    <div className="relative">
      <p className="text-body text-secondary leading-relaxed">
        {expanded ? text : text.slice(0, maxLength).replace(/\s+\S*$/, "")}
      </p>
      {!expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-caption text-amber hover:text-amber/80 font-medium transition-colors relative z-10"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
