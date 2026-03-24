"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ShareableComment from "@/components/ShareableComment";

const REACTIONS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDC80"];

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>;
};

type SortMode = "newest" | "oldest" | "reactions";

function getReactionTotal(comment: Comment): number {
  return Object.values(comment.reactions).reduce((a, b) => a + b, 0);
}

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
  listingAddress = "",
  listingPrice = "",
}: {
  listingId: string;
  isLocked?: boolean;
  listingAddress?: string;
  listingPrice?: string;
  verified?: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [reactingEmail, setReactingEmail] = useState("");
  const [showReplyPrompt, setShowReplyPrompt] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "success">("idle");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved commenter identity
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const { name: savedName, email: savedEmail } = JSON.parse(saved);
        if (savedName) setName(savedName);
        if (savedEmail) {
          setEmail(savedEmail);
          setReactingEmail(savedEmail);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch(`/api/comments?listingId=${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    switch (sortMode) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "reactions":
        sorted.sort((a, b) => getReactionTotal(b) - getReactionTotal(a));
        break;
    }
    return sorted;
  }, [comments, sortMode]);

  // Pagination logic
  const commentsToShow = useMemo(() => {
    if (comments.length <= 5) return sortedComments;
    if (comments.length < 20) {
      return expanded ? sortedComments : sortedComments.slice(0, 5);
    }
    return sortedComments.slice(0, visibleCount);
  }, [sortedComments, comments.length, expanded, visibleCount]);

  const showExpandButton = !expanded && comments.length > 5 && comments.length < 20;
  const remainingAfterExpand = comments.length - 5;
  const showLoadMore = comments.length >= 20 && visibleCount < comments.length;

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
        setShowReplyPrompt(true);
        setReplyEmail(email);
        try {
          localStorage.setItem("hf_commenter", JSON.stringify({ name, email }));
        } catch {
          // localStorage may be unavailable
        }
      } else {
        const err = await res.json();
        setPostError(err.error ?? "Failed to post");
      }
    } catch {
      setPostError("Network error");
    }
    setPosting(false);
  }

  async function handleReplySubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!replyEmail) return;
    setReplyStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: replyEmail,
          source: `comment-reply-${listingId}`,
        }),
      });
      setReplyStatus("success");
      try {
        localStorage.setItem("gwakgwak_subscribed_email", replyEmail);
      } catch {
        // ignore
      }
      setTimeout(() => {
        setShowReplyPrompt(false);
        setReplyStatus("idle");
      }, 3000);
    } catch {
      setReplyStatus("idle");
    }
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

  const handleShareTake = useCallback((commentId: string) => {
    const url = `${window.location.origin}/listing/${listingId}#comment-${commentId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }, [listingId]);

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "reactions", label: "Top" },
    { key: "oldest", label: "Oldest" },
  ];

  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-headline text-ink">
          {isLocked ? "Comments (Locked)" : "The Conversation"}
        </h2>
        {comments.length > 0 && (
          <p className="text-caption text-tertiary mt-1">
            {comments.length} take{comments.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* "Drop Your Take" divider — only shown when not locked */}
      {!isLocked && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary whitespace-nowrap">Drop Your Take</span>
          <div className="flex-1 h-px bg-divider" />
        </div>
      )}

      {/* Locked banner */}
      {isLocked && comments.length > 0 && (
        <div className="bg-surface rounded-card px-4 py-3 mb-6">
          <p className="text-body text-secondary">
            This property is no longer active. Comments are preserved but new comments are disabled.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-avatar skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton" />
                <div className="h-14 skeleton rounded-card" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && !isLocked && (
        <div className="text-center py-10 rounded-card bg-surface border border-divider mb-6">
          <p className="text-headline text-ink mb-1">No one&apos;s weighed in yet</p>
          <p className="text-body text-secondary">Be the first to share what you think about this listing.</p>
        </div>
      )}

      {/* Sort toggle */}
      {!loading && comments.length >= 2 && (
        <div className="flex items-center gap-4 mb-4">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortMode(opt.key)}
              className={`text-caption transition-colors ${
                sortMode === opt.key
                  ? "text-ink font-medium border-b border-ink pb-0.5"
                  : "text-tertiary hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="mb-8">
          {commentsToShow.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canReact={!isLocked && !!(name && (email || reactingEmail))}
              onReact={(type) => handleReact(comment.id, type)}
              onShare={() => handleShareTake(comment.id)}
              isLocked={isLocked}
              listingAddress={listingAddress}
              listingPrice={listingPrice}
              verified={false}
            />
          ))}

          {showExpandButton && remainingAfterExpand > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full text-center py-3 text-caption font-medium text-ink hover:text-secondary transition-colors"
            >
              Show all {comments.length} comments
            </button>
          )}

          {showLoadMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="w-full text-center py-3 text-caption font-medium text-ink hover:text-secondary transition-colors"
            >
              Load more comments
            </button>
          )}
        </div>
      )}

      {/* Post form */}
      {!isLocked && (
        <div className="rounded-card border border-divider bg-surface p-5">
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-button bg-bg border border-divider px-3 py-2.5 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-[rgba(232,168,124,0.4)] transition-colors"
              />
              <input
                type="email"
                placeholder="Email (stays private)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-button bg-bg border border-divider px-3 py-2.5 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-[rgba(232,168,124,0.4)] transition-colors"
              />
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="What do you know about this block that the listing doesn't say?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                maxLength={1000}
                className="comment-textarea w-full rounded-card border border-divider bg-bg px-3 py-2.5 text-body text-ink placeholder:text-tertiary transition-colors resize-none"
                style={{ minHeight: "100px" }}
              />
              <span className="absolute bottom-2 right-3 text-caption text-tertiary">
                {content.length}/1000
              </span>
            </div>
            {/* Quick suggestion chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Overpriced",
                "Steal of the century",
                "That kitchen though",
                "Hard pass",
                "Would make an offer",
                "Someone explain this price",
                "The neighborhood tho",
                "Needs work but potential",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setContent((prev) => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="text-caption px-3 py-1.5 rounded-full bg-bg border border-divider text-secondary hover:text-ink hover:border-tertiary/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {postError && (
              <p className="text-caption text-ink font-medium">{postError}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-caption text-tertiary">email stays private</p>
              <button
                type="submit"
                disabled={posting}
                className="px-6 py-2.5 bg-ink text-white text-body font-medium rounded-button hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post your take"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reply notification prompt */}
      {showReplyPrompt && !isLocked && (
        <div className="mt-4 bg-highlight border border-divider rounded-card p-4 animate-fade-in">
          {replyStatus === "success" ? (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-body text-ink">
                You&apos;ll be notified when someone replies!
              </span>
            </div>
          ) : (
            <>
              <p className="text-body text-ink font-medium mb-1">
                Want to get notified when someone replies?
              </p>
              <p className="text-caption text-secondary mb-3">
                We&apos;ll let you know when new opinions drop on this listing.
              </p>
              <form onSubmit={handleReplySubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={replyEmail}
                  onChange={(e) => setReplyEmail(e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2 text-body rounded-button bg-bg border border-divider text-ink placeholder:text-tertiary focus:outline-none focus:border-tertiary/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={replyStatus === "loading"}
                  className="shrink-0 px-4 py-2 text-body font-medium rounded-button bg-ink text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {replyStatus === "loading" ? "..." : "Notify me"}
                </button>
              </form>
              <button
                onClick={() => setShowReplyPrompt(false)}
                className="mt-2 text-caption text-tertiary hover:text-ink transition-colors"
              >
                No thanks
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  canReact,
  onReact,
  onShare,
  isLocked,
  listingAddress = "",
  listingPrice = "",
  verified = false,
}: {
  comment: Comment;
  canReact: boolean;
  onReact: (type: string) => void;
  onShare: () => void;
  isLocked: boolean;
  listingAddress?: string;
  listingPrice?: string;
  verified?: boolean;
}) {
  const [showCopied, setShowCopied] = useState(false);
  const [helpful, setHelpful] = useState(0);
  const [helpfulVoted, setHelpfulVoted] = useState(false);

  const reactionTotal = getReactionTotal(comment);
  const isHot = reactionTotal >= 5;

  const initials = comment.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleShare = () => {
    onShare();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleHelpful = () => {
    if (helpfulVoted) return;
    setHelpful((n) => n + 1);
    setHelpfulVoted(true);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={`fade-up flex gap-3.5 py-5 border-b border-divider last:border-0 ${isLocked ? "opacity-50" : ""} ${isHot ? "pl-3 border-l-[3px] border-l-[#E8A87C]/50 rounded-sm" : ""}`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-avatar bg-active flex items-center justify-center text-[11px] font-semibold text-ink shrink-0">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-title text-ink">{comment.name}</span>
          {verified && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(232,168,124,0.12)] text-[#E8A87C] border border-[rgba(232,168,124,0.2)]">
              ZIP ✓
            </span>
          )}
          <span className="text-caption text-tertiary">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-body text-ink mt-1 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Reactions + helpful */}
        <div className="flex gap-2 mt-2.5 flex-wrap items-center">
          {/* Helpful thumbs-up */}
          <button
            onClick={handleHelpful}
            disabled={helpfulVoted}
            className={`flex items-center gap-1 text-caption transition-colors mr-1 ${
              helpfulVoted ? "text-[#E8A87C]" : "text-tertiary/50 hover:text-secondary"
            } ${helpfulVoted ? "cursor-default" : "cursor-pointer"}`}
            title="Mark as helpful"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={helpfulVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {helpful > 0 && <span>{helpful}</span>}
          </button>

          {REACTIONS.map((r) => {
            const count = comment.reactions[r] ?? 0;
            return (
              <button
                key={r}
                onClick={() => canReact && onReact(r)}
                disabled={!canReact}
                className={`flex items-center gap-1 text-caption transition-colors ${
                  count > 0
                    ? "text-ink"
                    : "text-tertiary/40 hover:text-tertiary"
                } ${canReact ? "cursor-pointer" : "cursor-default"}`}
              >
                <span>{r}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}

          {/* Share button -- shows on hover via group */}
          <button
            onClick={handleShare}
            className="text-caption text-tertiary hover:text-ink transition-colors ml-1"
            title="Share this take"
          >
            {showCopied ? (
              <span className="text-ink">Copied!</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            )}
          </button>

          {listingAddress && (
            <ShareableComment
              name={comment.name}
              content={comment.content}
              createdAt={comment.createdAt}
              address={listingAddress}
              price={listingPrice}
              reactions={comment.reactions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
