"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/profile/Avatar";
import { CommentComposer } from "./CommentComposer";
import type { CommentNode } from "./types";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

interface Props {
  node: CommentNode;
  listingId: string;
  currentUserId: string | null;
  onUpdated: (updater: (n: CommentNode) => CommentNode) => void;
  onReplyAdded: (parentId: string, child: CommentNode) => void;
  onDeleted: () => void;
  depth?: number;
}

export function CommentItem({ node, listingId, currentUserId, onUpdated, onReplyAdded, onDeleted, depth = 0 }: Props) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const [busy, setBusy] = useState<string | null>(null);

  const isOwn = currentUserId !== null && node.user?.id === currentUserId;
  const isHot = node.likeCount >= 10;

  async function toggleLike() {
    setBusy("like");
    // optimistic
    onUpdated((n) => ({
      ...n,
      liked: !n.liked,
      likeCount: n.likeCount + (n.liked ? -1 : 1),
    }));
    try {
      await fetch(`/api/comments/${node.id}/like`, { method: "POST" });
    } catch {
      // revert
      onUpdated((n) => ({
        ...n,
        liked: !n.liked,
        likeCount: n.likeCount + (n.liked ? -1 : 1),
      }));
    } finally {
      setBusy(null);
    }
  }

  async function toggleRedFlag() {
    setBusy("flag");
    onUpdated((n) => ({ ...n, isRedFlag: !n.isRedFlag }));
    try {
      await fetch(`/api/comments/${node.id}/red-flag`, { method: "POST" });
    } catch {
      onUpdated((n) => ({ ...n, isRedFlag: !n.isRedFlag }));
    } finally {
      setBusy(null);
    }
  }

  async function saveEdit() {
    setBusy("edit");
    try {
      const res = await fetch(`/api/comments/${node.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        onUpdated((n) => ({ ...n, content: editContent, editedAt: new Date().toISOString() }));
        setEditing(false);
      }
    } finally {
      setBusy(null);
    }
  }

  async function doDelete() {
    if (!confirm("Delete this take?")) return;
    setBusy("delete");
    const res = await fetch(`/api/comments/${node.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
    setBusy(null);
  }

  const author = node.user;
  const displayName = author?.name ?? author?.username ?? node.legacyName ?? "Anonymous";
  const seed = author?.id ?? node.legacyName ?? node.id;

  return (
    <div className="pl-3" style={{ marginLeft: depth > 0 ? 12 : 0, borderLeft: depth > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
      <div className="flex gap-3">
        <Avatar src={author?.avatarUrl} seed={seed} label={displayName} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {author?.username ? (
              <Link href={`/u/${author.username}`} className="text-sm font-semibold text-ink hover:text-amber">{displayName}</Link>
            ) : (
              <span className="text-sm font-semibold text-ink">{displayName}</span>
            )}
            <span className="text-xs text-secondary">· {timeAgo(node.createdAt)}</span>
            {node.editedAt && <span className="text-xs text-secondary">(edited)</span>}
            {isHot && <span className="text-[10px] font-bold text-amber bg-amber/10 px-1.5 py-0.5 rounded-full">🔥 HOT</span>}
            {node.isRedFlag && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">🚩 RED FLAG</span>}
          </div>
          {editing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-bg p-2 text-sm text-ink"
              />
              <div className="mt-1 flex gap-2">
                <button onClick={saveEdit} disabled={busy === "edit"} className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-bg disabled:opacity-50">
                  {busy === "edit" ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setEditContent(node.content); }} className="text-xs text-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{node.content}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-secondary">
            <button onClick={toggleLike} disabled={busy === "like"} className={`hover:text-amber ${node.liked ? "text-amber font-semibold" : ""}`}>
              ♥ {node.likeCount}
            </button>
            <button onClick={() => setReplying((v) => !v)} className="hover:text-amber">Reply</button>
            <button onClick={toggleRedFlag} disabled={busy === "flag"} className={`hover:text-red-400 ${node.isRedFlag ? "text-red-400 font-semibold" : ""}`}>
              {node.isRedFlag ? "Unflag" : "🚩 Red flag"}
            </button>
            {isOwn && (
              <>
                <button onClick={() => setEditing(true)} className="hover:text-ink">Edit</button>
                <button onClick={doDelete} disabled={busy === "delete"} className="hover:text-red-400">Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
      {replying && (
        <div className="mt-3 ml-11">
          <CommentComposer
            listingId={listingId}
            parentId={node.id}
            placeholder={`Reply to ${displayName}…`}
            autoFocus
            onCancel={() => setReplying(false)}
            onPosted={(c) => {
              setReplying(false);
              onReplyAdded(node.id, {
                id: c.id,
                content: c.content,
                createdAt: new Date().toISOString(),
                editedAt: null,
                likeCount: 0,
                isRedFlag: false,
                liked: false,
                parentId: node.id,
                user: null, // hydrated on next refresh
                replies: [],
              });
            }}
          />
        </div>
      )}
      {node.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.replies.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              listingId={listingId}
              currentUserId={currentUserId}
              depth={depth + 1}
              onUpdated={(fn) => onUpdated((n) => updateInTree(n, child.id, fn))}
              onReplyAdded={onReplyAdded}
              onDeleted={() => onUpdated((n) => removeInTree(n, child.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// helpers used to update nested state
function updateInTree(node: CommentNode, id: string, fn: (n: CommentNode) => CommentNode): CommentNode {
  if (node.id === id) return fn(node);
  return { ...node, replies: node.replies.map((c) => updateInTree(c, id, fn)) };
}
function removeInTree(node: CommentNode, id: string): CommentNode {
  return { ...node, replies: node.replies.filter((c) => c.id !== id).map((c) => removeInTree(c, id)) };
}
