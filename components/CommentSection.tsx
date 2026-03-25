"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import ShareableComment from "@/components/ShareableComment";

const GwakyAI = dynamic(() => import("@/components/GwakyAI"), { ssr: false });

const REACTIONS = ["\uD83D\uDEA9", "\uD83D\uDCB8", "\uD83D\uDC40", "\uD83C\uDFC6", "\uD83D\uDC80"];
const REACTION_LABELS: Record<string, string> = {
  "\uD83D\uDEA9": "Red Flag",
  "\uD83D\uDCB8": "Overpriced",
  "\uD83D\uDC40": "Sus",
  "\uD83C\uDFC6": "Worth it",
  "\uD83D\uDC80": "Run",
};

const STYLE_PRESETS: { label: string; filter: string }[] = [
  { label: "Modern", filter: "saturate(1.1) contrast(1.1) brightness(1.05)" },
  { label: "Mediterranean", filter: "saturate(1.3) sepia(0.15) brightness(1.1)" },
  { label: "Farmhouse", filter: "saturate(0.9) sepia(0.2) contrast(1.05)" },
  { label: "Industrial", filter: "saturate(0.7) contrast(1.2) brightness(0.95)" },
  { label: "Minimalist", filter: "saturate(0.8) brightness(1.1) contrast(0.95)" },
];

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

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function CommentSection({
  listingId,
  isLocked = false,
  listingAddress = "",
  listingPrice = "",
  photos,
  listingContext,
}: {
  listingId: string;
  isLocked?: boolean;
  listingAddress?: string;
  listingPrice?: string;
  verified?: boolean;
  photos?: string[];
  listingContext?: {
    address: string;
    city: string;
    price: number;
    sqft: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    propertyType: string;
  };
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);
  const [reactingEmail, setReactingEmail] = useState("");
  const [showReplyPrompt, setShowReplyPrompt] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "success">("idle");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [inputMode, setInputMode] = useState<"take" | "ai">("take");
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [visionOpen, setVisionOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [lastPostedComment, setLastPostedComment] = useState<string | null>(null);

  // Gate states
  const [isJoined, setIsJoined] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinStep, setJoinStep] = useState<"info" | "compose">("info");

  // Restore saved commenter identity
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const { name: savedName, email: savedEmail, zip: savedZip } = JSON.parse(saved);
        if (savedName) setName(savedName);
        if (savedEmail) {
          setEmail(savedEmail);
          setReactingEmail(savedEmail);
        }
        if (savedZip) setZip(savedZip);
        if (savedName && savedEmail) {
          setIsJoined(true);
          setJoinStep("compose");
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

  // Show 2 comments as teaser if not joined, all if joined
  const commentsToShow = useMemo(() => {
    if (!isJoined && comments.length > 2) {
      return sortedComments.slice(0, 2);
    }
    if (comments.length <= 5) return sortedComments;
    if (comments.length < 20) {
      return expanded ? sortedComments : sortedComments.slice(0, 5);
    }
    return sortedComments.slice(0, visibleCount);
  }, [sortedComments, comments.length, expanded, visibleCount, isJoined]);

  const showExpandButton = isJoined && !expanded && comments.length > 5 && comments.length < 20;
  const remainingAfterExpand = comments.length - 5;
  const showLoadMore = isJoined && comments.length >= 20 && visibleCount < comments.length;
  const hiddenCount = !isJoined && comments.length > 2 ? comments.length - 2 : 0;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsJoined(true);
    setJoinStep("compose");
    setShowJoinForm(false);
    // Save identity
    try {
      localStorage.setItem("hf_commenter", JSON.stringify({ name, email, zip }));
    } catch {
      // ignore
    }
    // Subscribe for notifications
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source: `join-community-${listingId}`,
        name,
        zip: zip || undefined,
      }),
    }).catch(() => {});
    // Track join event
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "community_join",
        data: { listingId, hasZip: !!zip, source: "comment_gate" },
      }),
    }).catch(() => {});
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, name, email, content, ...(selectedStyle ? { style: selectedStyle } : {}) }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setLastPostedComment(content);
        setContent("");
        setSelectedStyle(null);
        setVisionOpen(false);
        setReactingEmail(email);
        setShowReplyPrompt(true);
        setReplyEmail(email);
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 8000);
        try {
          localStorage.setItem("hf_commenter", JSON.stringify({ name, email, zip }));
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
        localStorage.setItem("gwaky_subscribed_email", replyEmail);
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

  async function handleReplyPost(replyToName: string) {
    if (!replyContent.trim() || !name || !email) return;
    setPostingReply(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name,
          email,
          content: `@${replyToName} ${replyContent}`,
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch {
      // silently fail
    }
    setPostingReply(false);
  }

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
            {comments.length} take{comments.length !== 1 ? "s" : ""} from the community
          </p>
        )}
      </div>

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

      {/* ═══ ENGAGEMENT CTA — when not joined and there are comments ═══ */}
      {!isJoined && !isLocked && !loading && comments.length > 0 && !showJoinForm && (
        <div className="mb-6 rounded-2xl border-2 border-amber/30 bg-gradient-to-br from-amber/5 via-surface to-highlight p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {comments.slice(0, 3).map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-amber/15 border-2 border-surface flex items-center justify-center text-[9px] font-bold text-amber">
                    {c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                ))}
              </div>
              <span className="text-caption text-secondary">
                {comments.length} neighbor{comments.length !== 1 ? "s" : ""} talking about this property
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink mb-1">
              Get in
            </h3>
            <p className="text-body text-secondary mb-4">
              Get the full picture from people who actually live here. Share what you know, see what others are saying.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJoinForm(true)}
                className="px-8 py-3.5 bg-amber text-white text-[15px] font-bold rounded-full hover:bg-amber/90 active:scale-[0.97] transition-all shadow-glow-amber"
              >
                Join &amp; see all takes &rarr;
              </button>
              <span className="text-caption text-tertiary">Free. 10 seconds.</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE CTA — when 0 comments and not joined ═══ */}
      {!loading && comments.length === 0 && !isLocked && !showJoinForm && !isJoined && (
        <div className="text-center py-10 rounded-2xl bg-gradient-to-br from-amber/5 via-surface to-highlight border-2 border-dashed border-amber/20 mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-ink mb-2">
            No one&apos;s said anything yet. You go first.
          </h3>
          <p className="text-[15px] text-secondary max-w-sm mx-auto mb-6">
            The block is watching. What does this listing not tell you?
          </p>
          <button
            onClick={() => { setShowJoinForm(true); }}
            className="w-full max-w-sm mx-auto block py-4 bg-amber text-white text-[18px] font-bold rounded-lg hover:bg-amber/90 active:scale-[0.97] transition-all shadow-glow-amber"
          >
            🫖 Spill the tea on this place &rarr;
          </button>
        </div>
      )}

      {/* ═══ JOIN FORM — data capture gate ═══ */}
      {showJoinForm && !isJoined && (
        <div className="mb-6 rounded-2xl border border-divider bg-surface p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3 className="text-title text-ink">Get in on it</h3>
              <p className="text-caption text-tertiary">Anonymous. Unfiltered. Zero cap.</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl bg-bg border border-divider px-4 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-amber/40 transition-colors"
              />
              <input
                type="email"
                placeholder="Email (stays private)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl bg-bg border border-divider px-4 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-amber/40 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Your zip code (optional — unlocks local badge)"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^0-9-]/g, "").slice(0, 10))}
              className="w-full rounded-xl bg-bg border border-divider px-4 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-amber/40 transition-colors"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 bg-ink text-bg text-body font-medium rounded-full hover:bg-ink/90 active:scale-[0.97] transition-all"
              >
                Get in
              </button>
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-2.5 text-body text-tertiary hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-4 pt-1 text-caption text-tertiary">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Email never shared
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                No spam, ever
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Sort toggle */}
      {!loading && comments.length >= 2 && isJoined && (
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
              canReact={!isLocked && isJoined && !!(name && (email || reactingEmail))}
              onReact={(type) => handleReact(comment.id, type)}
              onShare={() => handleShareTake(comment.id)}
              isLocked={isLocked}
              listingAddress={listingAddress}
              listingPrice={listingPrice}
              listingId={listingId}
              verified={false}
              isReplyOpen={replyingTo === comment.id}
              onReplyToggle={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyContent("");
              }}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onReplySubmit={() => handleReplyPost(comment.name)}
              postingReply={postingReply}
              canReply={!isLocked && isJoined && !!(name && email)}
            />
          ))}

          {/* Blurred teaser for hidden comments */}
          {hiddenCount > 0 && !showJoinForm && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/80 to-bg z-10 flex items-end justify-center pb-4">
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="px-8 py-3.5 bg-amber text-white text-[15px] font-bold rounded-full hover:bg-amber/90 shadow-glow-amber active:scale-[0.97] transition-all"
                >
                  See {hiddenCount} more take{hiddenCount !== 1 ? "s" : ""} &rarr;
                </button>
              </div>
              {/* Blurred preview of next comment */}
              {sortedComments[2] && (
                <div className="blur-[6px] opacity-60 pointer-events-none py-5 border-b border-divider">
                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-avatar bg-active shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-active rounded mb-2" />
                      <div className="h-12 bg-active rounded-card" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* ═══ COMPOSE FORM — only shows after joining ═══ */}
      {!isLocked && isJoined && (
        <div id="comment-form" className="rounded-2xl border border-divider bg-surface p-5 scroll-mt-20">
          {/* Identity bar */}
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-divider">
            <div className="w-8 h-8 rounded-full bg-amber/15 flex items-center justify-center text-xs font-bold text-amber">
              {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-ink">{formatName(name)}</span>
              {zip && (
                <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-amber/12 text-amber border border-amber/20">
                  ZIP {zip.slice(0, 5)} ✓
                </span>
              )}
            </div>
            <button
              onClick={() => { setIsJoined(false); setJoinStep("info"); setShowJoinForm(true); }}
              className="text-caption text-tertiary hover:text-ink transition-colors"
            >
              Switch
            </button>
          </div>

          {/* ── Mode toggle: Drop a take / Ask Gwaky AI ── */}
          <div className="flex items-center gap-1 mb-4 p-1 bg-bg rounded-full border border-divider w-fit">
            <button
              type="button"
              onClick={() => setInputMode("take")}
              className={`px-4 py-1.5 text-caption font-medium rounded-full transition-all ${
                inputMode === "take"
                  ? "bg-ink text-bg shadow-sm"
                  : "text-tertiary hover:text-ink"
              }`}
            >
              Drop a take
            </button>
            <button
              type="button"
              onClick={() => setInputMode("ai")}
              className={`px-4 py-1.5 text-caption font-medium rounded-full transition-all ${
                inputMode === "ai"
                  ? "bg-accent text-white shadow-sm"
                  : "text-tertiary hover:text-ink"
              }`}
            >
              Ask Gwaky AI
            </button>
          </div>

          {/* ── Gwaky AI mode ── */}
          {inputMode === "ai" && listingContext && (
            <GwakyAI
              listingId={listingId}
              listingContext={{
                ...listingContext,
                topTakes: comments.slice(0, 5).map((c) => c.content.slice(0, 80)),
              }}
            />
          )}
          {inputMode === "ai" && !listingContext && (
            <div className="text-center py-6 text-caption text-tertiary">
              AI chat is not available for this listing.
            </div>
          )}

          {/* ── Drop a take mode ── */}
          {inputMode === "take" && <form onSubmit={handlePost} className="space-y-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="What do you know about this block that the listing doesn't say?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                maxLength={1000}
                className="comment-textarea w-full rounded-xl border border-divider bg-bg px-4 py-3 text-body text-ink placeholder:text-tertiary transition-colors resize-none"
                style={{ minHeight: "100px" }}
              />
              <span className="absolute bottom-2.5 right-3 text-caption text-tertiary">
                {content.length}/1000
              </span>
            </div>

            {/* Quick suggestion chips */}
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {[
                "major red flag 🚩",
                "underpriced fr",
                "that kitchen tho 💀",
                "hard pass",
                "would lowkey offer",
                "explain this price plz",
                "the block is elite",
                "needs work but potential",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setContent((prev) => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="text-caption px-3 py-2 sm:py-1.5 min-h-[36px] sm:min-h-0 rounded-full bg-bg border border-divider text-secondary hover:text-ink hover:border-tertiary/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* ═══ STYLE VISION — always visible with photo ═══ */}
            {photos && photos.length > 0 && (
              <div className="rounded-xl border border-amber/20 bg-gradient-to-br from-amber/5 to-bg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎨</span>
                  <span className="text-sm font-medium text-ink">Share your vision for this place</span>
                </div>
                {/* Photo preview with filter — always shown */}
                <div className="overflow-hidden rounded-lg relative h-[100px] sm:h-[120px]">
                  <img
                    src={photos[0]}
                    alt="Style preview"
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{
                      filter: selectedStyle
                        ? STYLE_PRESETS.find((s) => s.label === selectedStyle)?.filter
                        : "none",
                    }}
                  />
                  {selectedStyle && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-semibold">
                      {selectedStyle} filter
                    </div>
                  )}
                </div>
                {/* Style preset buttons — always shown */}
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setSelectedStyle((prev) =>
                          prev === preset.label ? null : preset.label
                        )
                      }
                      className={`text-caption px-3 py-1.5 rounded-full border transition-all ${
                        selectedStyle === preset.label
                          ? "bg-amber text-white border-amber shadow-sm"
                          : "bg-surface border-divider text-secondary hover:text-ink hover:border-amber/30"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                  {selectedStyle && (
                    <button
                      type="button"
                      onClick={() => setSelectedStyle(null)}
                      className="text-caption px-2 py-1.5 text-tertiary hover:text-ink transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error / Success */}
            {postError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p className="text-caption text-red-700 font-medium">{postError}</p>
              </div>
            )}
            {postSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-caption text-emerald-700 font-medium">Your take has been posted!</p>
                </div>
                <div className="flex items-center gap-3 pl-6">
                  <span className="text-caption text-secondary whitespace-nowrap">Share your take</span>
                  <SocialShareRow
                    commentText={lastPostedComment ?? ""}
                    listingAddress={listingAddress}
                    listingId={listingId}
                    compact
                  />
                </div>
              </div>
            )}

            {/* Submit row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-caption text-tertiary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                private &amp; secure
                {selectedStyle && (
                  <span className="px-2 py-0.5 rounded-full bg-amber/12 text-amber border border-amber/20 font-semibold text-xs">
                    {selectedStyle} vision
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={posting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink text-bg text-body font-medium rounded-full hover:bg-ink/90 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {posting && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {posting ? "Posting..." : "Send it"}
              </button>
            </div>
          </form>}
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
                  className="shrink-0 px-4 py-2 text-body font-medium rounded-button bg-ink text-bg hover:bg-ink/90 transition-colors disabled:opacity-50"
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

function getCredibilityTag(content: string): { label: string; className: string } {
  const lower = content.toLowerCase();
  if (/\b(years?|lived here|moved|since)\b/.test(lower)) {
    const yearMatch = lower.match(/(?:since|in)\s*((?:19|20)\d{2})/);
    const year = yearMatch ? yearMatch[1] : "ʼ09";
    return { label: `Local Since ${year}`, className: "bg-amber-100 text-amber-800 border border-amber-200" };
  }
  if (/\b(rent|tenant|lease)\b/.test(lower)) {
    return { label: "Past Renter", className: "bg-blue-100 text-blue-800 border border-blue-200" };
  }
  if (/\b(neighbor|next door|block)\b/.test(lower)) {
    return { label: "Verified Neighbor", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" };
  }
  if (/\b(drive|visited|looked at)\b/.test(lower)) {
    return { label: "Drive-by Opinion", className: "bg-gray-100 text-gray-500 border border-gray-200 italic" };
  }
  return { label: "Neighbor", className: "bg-gray-100 text-gray-600 border border-gray-200" };
}

function CommentItem({
  comment,
  canReact,
  onReact,
  onShare,
  isLocked,
  listingAddress = "",
  listingPrice = "",
  listingId = "",
  verified = false,
  isReplyOpen = false,
  onReplyToggle,
  replyContent = "",
  onReplyContentChange,
  onReplySubmit,
  postingReply = false,
  canReply = false,
}: {
  comment: Comment;
  canReact: boolean;
  onReact: (type: string) => void;
  onShare: () => void;
  isLocked: boolean;
  listingAddress?: string;
  listingPrice?: string;
  listingId?: string;
  verified?: boolean;
  isReplyOpen?: boolean;
  onReplyToggle?: () => void;
  replyContent?: string;
  onReplyContentChange?: (val: string) => void;
  onReplySubmit?: () => void;
  postingReply?: boolean;
  canReply?: boolean;
}) {
  const [showCopied, setShowCopied] = useState(false);
  const [helpful, setHelpful] = useState(0);
  const [helpfulVoted, setHelpfulVoted] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!showSharePopover) return;
    function handleClick(e: MouseEvent) {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target as Node)) {
        setShowSharePopover(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSharePopover]);

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
      className={`fade-up flex gap-3.5 py-5 border-b border-divider last:border-0 relative ${isLocked ? "opacity-50" : ""} ${isHot ? "pl-3 border-l-[3px] border-l-[#FF4D00]/50 rounded-sm" : ""}`}
    >
      {/* Vibe Score Badge */}
      {(() => {
        const vFires = comment.reactions["\uD83D\uDD25"] ?? 0;
        const vTrophies = comment.reactions["\uD83C\uDFC6"] ?? 0;
        const vEyes = comment.reactions["\uD83D\uDC40"] ?? 0;
        const vMoney = comment.reactions["\uD83D\uDCB8"] ?? 0;
        const vFlags = comment.reactions["\uD83D\uDEA9"] ?? 0;
        const vSkulls = comment.reactions["\uD83D\uDC80"] ?? 0;
        const vibeScore = (vFires * 10) + (vTrophies * 15) + (vEyes * -5) + (vMoney * -10) + (vFlags * -15) + (vSkulls * -20);
        const hasVibeReactions = vFires + vTrophies + vEyes + vMoney + vFlags + vSkulls > 0;
        if (!hasVibeReactions) return null;
        const badgeColor = vibeScore < 0 ? "#FF3B3B" : vibeScore <= 50 ? "#FFD166" : "#4ADE80";
        const textColor = vibeScore <= 50 && vibeScore >= 0 ? "#000" : "#fff";
        const vibeLabel = vibeScore >= 0 ? `+${vibeScore}` : `${vibeScore}`;
        return (
          <div className="absolute top-4 right-0 px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums" style={{ backgroundColor: badgeColor, color: textColor }}>
            {vibeLabel}
          </div>
        );
      })()}
      {/* Avatar */}
      <div className="w-10 h-10 rounded-avatar bg-active flex items-center justify-center text-xs font-semibold text-ink shrink-0">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-title text-ink">{formatName(comment.name)}</span>
          {(() => {
            const tag = getCredibilityTag(comment.content);
            return (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${tag.className}`}>
                {tag.label}
              </span>
            );
          })()}
          {verified && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[rgba(255,77,0,0.12)] text-accent border border-[rgba(255,77,0,0.2)]">
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
              helpfulVoted ? "text-accent" : "text-tertiary/50 hover:text-secondary"
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
                title={REACTION_LABELS[r] ?? r}
                className={`flex items-center gap-1 text-base transition-colors ${
                  count > 0
                    ? "text-ink"
                    : "text-tertiary/40 hover:text-tertiary"
                } ${canReact ? "cursor-pointer" : "cursor-default"}`}
              >
                <span>{r}</span>
                {count > 0 && <span className="text-caption">{REACTION_LABELS[r]} {count}</span>}
              </button>
            );
          })}

          {/* Reply button */}
          {canReply && onReplyToggle && (
            <button
              onClick={onReplyToggle}
              className={`flex items-center gap-1 text-caption transition-colors ml-1 ${
                isReplyOpen ? "text-amber font-medium" : "text-tertiary hover:text-ink"
              }`}
              title="Reply to this take"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Add your take</span>
            </button>
          )}

          {/* Share button with popover */}
          <div className="relative ml-1" ref={sharePopoverRef}>
            <button
              onClick={() => setShowSharePopover((v) => !v)}
              className={`text-caption transition-colors ${showSharePopover ? "text-amber" : "text-tertiary hover:text-ink"}`}
              title="Share this take"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            {showSharePopover && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-divider rounded-xl shadow-lg p-2.5 animate-fade-in z-20 whitespace-nowrap">
                <SocialShareRow
                  commentText={comment.content}
                  listingAddress={listingAddress}
                  listingId={listingId}
                  compact
                />
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-surface border-r border-b border-divider rotate-45" />
              </div>
            )}
          </div>

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

        {/* Inline reply input */}
        {isReplyOpen && onReplyContentChange && onReplySubmit && (
          <div className="mt-2.5 flex items-center gap-2 animate-fade-in">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              placeholder={`Reply to ${formatName(comment.name)}...`}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-full bg-bg border border-divider text-ink placeholder:text-tertiary focus:outline-none focus:border-amber/40 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && replyContent.trim()) {
                  e.preventDefault();
                  onReplySubmit();
                }
              }}
              autoFocus
            />
            <button
              onClick={onReplySubmit}
              disabled={!replyContent.trim() || postingReply}
              className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-full bg-amber text-white hover:bg-amber/90 active:scale-[0.97] transition-all disabled:opacity-40"
            >
              {postingReply ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Social Share Row ═══ */
function SocialShareRow({
  commentText,
  listingAddress,
  listingId,
  compact = false,
}: {
  commentText: string;
  listingAddress: string;
  listingId: string;
  compact?: boolean;
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const truncated = commentText.length > 200 ? commentText.slice(0, 197) + "..." : commentText;
  const listingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/listing/${listingId}`
    : `https://gwaky.com/listing/${listingId}`;
  const shareBody = `"${truncated}" \u{1F3E0} See what neighbors are saying about ${listingAddress} on Gwaky`;
  const encodedText = encodeURIComponent(shareBody);
  const encodedUrl = encodeURIComponent(listingUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
  const smsUrl = `sms:?body=${encodedText}%20${encodedUrl}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareBody} ${listingUrl}`).catch(() => {});
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(listingUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const btnBase = compact
    ? "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
    : "w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110";

  return (
    <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20`}
        title="Share on X"
      >
        <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Instagram — copy for stories */}
      <button
        onClick={handleCopyText}
        className={`${btnBase} bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20`}
        title="Copy for Instagram Stories"
      >
        <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      </button>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20`}
        title="Share on Facebook"
      >
        <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>

      {/* iMessage / SMS */}
      <a
        href={smsUrl}
        className={`${btnBase} bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20`}
        title="Share via iMessage"
      >
        <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.614 1.384 4.957 3.563 6.563C5.2 18.594 4.2 20.5 2.5 22c2.5 0 5-1 6.854-2.688.863.122 1.753.188 2.646.188C17.523 2 22 5.813 22 10.5S17.523 19 12 19c-.893 0-1.783-.066-2.646-.188C7.5 21 5 22 2.5 22c1.7-1.5 2.7-3.406 3.063-4.937C3.384 15.457 2 13.114 2 10.5 2 5.813 6.477 2 12 2z"/>
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className={`${btnBase} ${copiedLink ? "bg-emerald-500/15 text-emerald-600" : "bg-ink/5 text-secondary hover:bg-ink/10"}`}
        title={copiedLink ? "Copied!" : "Copy link"}
      >
        {copiedLink ? (
          <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        )}
      </button>
    </div>
  );
}
