"use client";

import { useEffect, useState, useRef } from "react";

const REACTIONS = ["❤️", "🔥", "😂", "😮", "💀"];

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>;
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export default function CommentSection({
  listingId,
  isLocked = false,
}: {
  listingId: string;
  isLocked?: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [reactingEmail, setReactingEmail] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/comments?listingId=${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, name, email, content }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
        setReactingEmail(email);
      } else {
        const err = await res.json();
        setPostError(err.error ?? "Failed to post");
      }
    } catch {
      setPostError("Network error");
    }
    setPosting(false);
  }

  async function handleReact(commentId: string, type: string) {
    const reactEmail = reactingEmail || email;
    const reactName = name;
    if (!reactEmail || !reactName) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reactEmail, name: reactName, type }),
      });
      if (res.ok) {
        const { reactions } = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, reactions } : c))
        );
      }
    } catch {
      // silently fail
    }
  }

  const totalReactions = comments.reduce((sum, c) =>
    sum + Object.values(c.reactions).reduce((a, b) => a + b, 0), 0
  );

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-bold text-ink">
            {isLocked ? "Comments (Locked)" : "Comments"}
          </h2>
          {comments.length > 0 && (
            <span className="text-xs font-semibold text-muted bg-tag px-2.5 py-1 rounded-full">
              {comments.length}
            </span>
          )}
          {totalReactions > 0 && (
            <span className="text-xs font-semibold text-accent bg-red-50 px-2.5 py-1 rounded-full">
              🔥 {totalReactions}
            </span>
          )}
        </div>
        {isLocked && (
          <span className="text-xs font-medium text-muted flex items-center gap-1">
            🔒 This listing sold — comments are locked
          </span>
        )}
      </div>

      {/* Locked banner */}
      {isLocked && comments.length > 0 && (
        <div className="bg-tag rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <span className="text-sm">🔒</span>
          <p className="text-sm text-muted">
            This property is no longer active. Comments are preserved but new comments are disabled.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton" />
                <div className="h-12 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && !isLocked && (
        <div className="text-center py-10 rounded-xl border border-dashed border-border bg-white mb-6">
          <p className="text-3xl mb-2">💬</p>
          <p className="font-display font-semibold text-ink text-sm">No comments yet</p>
          <p className="text-xs text-muted mt-1">Be the first to call it out</p>
        </div>
      )}

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-1 mb-8">
          {comments.map((comment, i) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canReact={!isLocked && !!(name && (email || reactingEmail))}
              onReact={(type) => handleReact(comment.id, type)}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      {/* Post form — only if not locked */}
      {!isLocked && (
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="font-display font-semibold text-sm text-ink mb-4">
            Leave a comment
          </p>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg border border-border px-3 py-2.5 text-sm bg-bg focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10"
              />
              <input
                type="email"
                placeholder="Email (stays private)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-border px-3 py-2.5 text-sm bg-bg focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10"
              />
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="Great price for this area... / Love the yard / Kitchen needs work / Too expensive for the neighborhood..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                maxLength={1000}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-bg focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10 resize-none"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted/40">
                {content.length}/1000
              </span>
            </div>
            {/* Quick comment suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Great price!",
                "Overpriced",
                "Love this neighborhood",
                "Needs updating",
                "Pet friendly?",
                "How's the parking?",
                "Beautiful kitchen",
                "Noisy area",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setContent((prev) => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border text-muted hover:text-ink hover:border-ink/30 hover:bg-tag transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {postError && (
              <p className="text-xs text-accent font-medium">{postError}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted/50">email stays private</p>
              <button
                type="submit"
                disabled={posting}
                className="px-5 py-2 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post →"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  canReact,
  onReact,
  isLocked,
}: {
  comment: Comment;
  canReact: boolean;
  onReact: (type: string) => void;
  isLocked: boolean;
}) {
  const initials = comment.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color from name
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-yellow-100 text-yellow-700",
  ];
  const colorIndex = comment.name.charCodeAt(0) % colors.length;

  return (
    <div className={`relative flex gap-3 py-3 comment-thread ${isLocked ? "opacity-60" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colors[colorIndex]}`}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-ink">{comment.name}</span>
          <span className="text-xs text-muted/50">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-ink/80 mt-0.5 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Reactions */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {REACTIONS.map((r) => {
            const count = comment.reactions[r] ?? 0;
            return (
              <button
                key={r}
                onClick={() => canReact && onReact(r)}
                disabled={!canReact}
                className={`flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full transition-colors ${
                  count > 0
                    ? "bg-tag text-ink font-semibold"
                    : "text-muted/40 hover:bg-tag hover:text-muted"
                } ${canReact ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className="text-[13px]">{r}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
