"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import type { CommentNode } from "./types";

interface Props {
  listingId: string;
}

export function ThreadedComments({ listingId }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/threaded?listingId=${listingId}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setComments(json.comments ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { reload(); }, [reload]);

  function updateRoot(rootId: string, fn: (n: CommentNode) => CommentNode) {
    setComments((cs) => cs.map((c) => (c.id === rootId ? fn(c) : c)));
  }

  function handleReplyAdded(parentId: string, child: CommentNode) {
    setComments((cs) =>
      cs.map((root) => addReply(root, parentId, child))
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink mb-3">The take section</h2>
      <CommentComposer
        listingId={listingId}
        onPosted={() => reload()}
      />

      {loading && <div className="mt-6 text-sm text-secondary">Loading takes…</div>}
      {error && <div className="mt-6 text-sm text-red-400">{error}</div>}
      {!loading && comments.length === 0 && !error && (
        <div className="mt-6 text-sm text-secondary">Be the first to drop a take.</div>
      )}

      <div className="mt-6 space-y-5">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            node={c}
            listingId={listingId}
            currentUserId={session?.user?.id ?? null}
            onUpdated={(fn) => updateRoot(c.id, fn)}
            onReplyAdded={handleReplyAdded}
            onDeleted={() => setComments((cs) => cs.filter((x) => x.id !== c.id))}
          />
        ))}
      </div>
    </div>
  );
}

function addReply(node: CommentNode, parentId: string, child: CommentNode): CommentNode {
  if (node.id === parentId) {
    return { ...node, replies: [...node.replies, child] };
  }
  return { ...node, replies: node.replies.map((r) => addReply(r, parentId, child)) };
}
