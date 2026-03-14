"use client";

import { useEffect, useState } from "react";

const REACTIONS = ["❤️", "🔥", "😂", "😮", "💭"];

const BUBBLE_COLORS = [
  { bg: "bg-goldenrod", text: "text-ink",   hex: "#FFD000" },
  { bg: "bg-coral",     text: "text-white", hex: "#FF4040" },
  { bg: "bg-sage",      text: "text-white", hex: "#4DB861" },
  { bg: "bg-sky",       text: "text-white", hex: "#3A8EF6" },
  { bg: "bg-lavender",  text: "text-white", hex: "#A855F7" },
  { bg: "bg-pink",      text: "text-white", hex: "#FF5FA0" },
];

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
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="font-display text-2xl uppercase text-ink">The Conversation</h2>
        {comments.length > 0 && (
          <span className="font-display text-xs uppercase border-2 border-ink px-3 py-1 rounded-full bg-goldenrod text-ink shadow-brute-sm">
            {comments.length} {comments.length === 1 ? "take" : "takes"}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border-3 border-ink/20 animate-pulse bg-ink/5" />
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-12 rounded-2xl border-3 border-dashed border-ink/30 bg-cream mb-8">
          <p className="text-4xl mb-3">🏡</p>
          <p className="font-display text-lg uppercase text-ink">No takes yet.</p>
          <p className="text-gray-500 text-sm mt-1 font-medium">Be the first to share your hot take on this place!</p>
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-6 mb-10">
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
      <div className="rounded-2xl border-3 border-ink bg-coral p-6 shadow-brute">
        <p className="font-display text-2xl text-white uppercase mb-5">Drop Your Take 💬</p>
        <form onSubmit={handlePost} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl border-2 border-ink bg-cream text-ink placeholder-ink/40 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-goldenrod"
            />
            <input
              type="email"
              placeholder="Email (private)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border-2 border-ink bg-cream text-ink placeholder-ink/40 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-goldenrod"
            />
          </div>
          <textarea
            placeholder="Love the kitchen? Hate the HOA? Obsessed with the yard? Spill it all."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border-2 border-ink bg-cream text-ink placeholder-ink/40 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-goldenrod resize-none"
          />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-white/80 font-medium">Email stays private. You&apos;ll get notified when someone reacts.</p>
            {postError && <p className="text-xs text-goldenrod font-bold">{postError}</p>}
          </div>
          <button
            type="submit"
            disabled={posting}
            className="font-display text-sm uppercase bg-goldenrod text-ink border-2 border-ink px-6 py-2.5 rounded-xl hover:bg-cream transition-colors disabled:opacity-50 shadow-brute-sm"
          >
            {posting ? "Posting…" : "Post Comment →"}
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
  const colorIndex = comment.name.charCodeAt(0) % BUBBLE_COLORS.length;
  const color = BUBBLE_COLORS[colorIndex];

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full border-3 border-ink flex items-center justify-center font-display text-xs shrink-0 shadow-brute-sm ${color.bg} ${color.text}`}
      >
        {initials}
      </div>

      {/* Speech bubble */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          {/* Bubble tail */}
          <div className="absolute top-4 -left-3 w-0 h-0 pointer-events-none">
            <div style={{
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderRight: "12px solid #111111",
              position: "absolute", left: 0, top: -1,
            }} />
            <div style={{
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: `9px solid ${color.hex}`,
              position: "absolute", left: 3, top: 1,
            }} />
          </div>

          <div className={`rounded-2xl border-3 border-ink p-4 shadow-brute-sm ${color.bg}`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`font-display text-sm uppercase ${color.text}`}>{comment.name}</span>
              <span className={`text-xs opacity-60 ${color.text} font-medium`}>{timeAgo(comment.createdAt)}</span>
            </div>
            <p className={`text-sm leading-relaxed font-medium ${color.text}`}>{comment.content}</p>

            {/* Reactions */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {REACTIONS.map((r) => {
                const count = comment.reactions[r] ?? 0;
                return (
                  <button
                    key={r}
                    onClick={() => canReact && onReact(r)}
                    title={canReact ? `React with ${r}` : "Post a comment to react"}
                    className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-full border-2 border-ink font-bold transition-all ${
                      count > 0 ? "bg-ink text-cream" : "bg-white/60 text-ink hover:bg-white"
                    } ${canReact ? "cursor-pointer active:scale-95" : "cursor-default"}`}
                  >
                    <span>{r}</span>
                    {count > 0 && <span className="text-xs">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
