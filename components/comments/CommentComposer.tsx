"use client";
import { useState } from "react";

interface Props {
  listingId: string;
  parentId?: string | null;
  placeholder?: string;
  onPosted: (newComment: { id: string; content: string; parentId: string | null }) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentComposer({ listingId, parentId = null, placeholder, onPosted, onCancel, autoFocus }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments/threaded", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, parentId, content }),
      });
      if (res.status === 401) {
        // Surface sign-in
        window.location.href = `/?signin=1&returnTo=/listing/${listingId}`;
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      onPosted({ id: json.id, content, parentId });
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? "Drop a take…"}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={2000}
        className="w-full bg-transparent text-sm text-ink placeholder:text-secondary outline-none resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-secondary">{content.length}/2000</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-xs text-secondary hover:text-ink">Cancel</button>
          )}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-full bg-amber px-4 py-1.5 text-xs font-semibold text-bg hover:bg-amber/90 disabled:opacity-50"
          >
            {submitting ? "Posting…" : parentId ? "Reply" : "Post"}
          </button>
        </div>
      </div>
      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
    </form>
  );
}
