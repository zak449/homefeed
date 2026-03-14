"use client";

import { useEffect, useState } from "react";

const REACTIONS = ["❤️", "🔥", "😂", "😮", "💭"];

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
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function CommentSection({ listingId }: { listingId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [reactingEmail, setReactingEmail] = useState("");

  useEffect(() => {
    fetch(`/api/comments?listingId=${listingId}`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [listingId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, name, email, content }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setContent("");
      // Persist email/name in state so user can react later
      setReactingEmail(email);
    } else {
      const err = await res.json();
      setPostError(err.error ?? "Failed to post comment");
    }
    setPosting(false);
  }

  async function handleReact(commentId: string, type: string) {
    const reactEmail = reactingEmail || email;
    const reactName = name;
    if (!reactEmail || !reactName) return;

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
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-6">The Conversation</h2>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-10 bg-cream rounded-3xl border border-dashed border-gray-200">
          <p className="text-3xl mb-2">🏡</p>
          <p className="text-gray-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              canReact={!!(name && (email || reactingEmail))}
              onReact={(type) => handleReact(comment.id, type)}
            />
          ))}
        </div>
      )}

      {/* Post form */}
      <div className="bg-ink rounded-3xl p-6">
        <p className="font-display text-xl text-white mb-4">Join the chat</p>
        <form onSubmit={handlePost} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
            <input
              type="email"
              placeholder="Your email (private)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>
          <textarea
            placeholder="What do you think about this place? Love the kitchen? The neighborhood? Spill it."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">Your email is never shown publicly. You&apos;ll get alerts when someone reacts.</p>
            {postError && <p className="text-xs text-coral">{postError}</p>}
          </div>
          <button
            type="submit"
            disabled={posting}
            className="bg-coral text-white font-bold px-6 py-2.5 rounded-xl hover:bg-coral/90 transition-colors text-sm disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post comment →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommentBubble({
  comment,
  canReact,
  onReact,
}: {
  comment: Comment;
  canReact: boolean;
  onReact: (type: string) => void;
}) {
  const initials = comment.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarColors = ["bg-coral", "bg-sky", "bg-sage", "bg-lavender", "bg-clay", "bg-goldenrod"];
  const colorIndex = comment.name.charCodeAt(0) % avatarColors.length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-full ${avatarColors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-ink">{comment.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

          {/* Reactions */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {REACTIONS.map((r) => {
              const count = comment.reactions[r] ?? 0;
              return (
                <button
                  key={r}
                  onClick={() => canReact && onReact(r)}
                  title={canReact ? `React with ${r}` : "Post a comment to react"}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all border ${
                    count > 0
                      ? "bg-goldenrod/20 border-goldenrod/40 text-ink font-semibold"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-goldenrod/10 hover:border-goldenrod/30"
                  } ${canReact ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span>{r}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
