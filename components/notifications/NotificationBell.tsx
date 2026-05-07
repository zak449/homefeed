"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const POLL_INTERVAL = 30_000;

export function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch initial state + start SSE / polling
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notifications?limit=20");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setItems(json.items ?? []);
        setUnread(json.unread ?? 0);
      } catch { /* ignore */ }
    }
    load();

    // Try SSE first
    try {
      const es = new EventSource("/api/notifications/stream");
      eventSourceRef.current = es;
      es.addEventListener("notification", () => load());
      es.addEventListener("error", () => {
        es.close();
        eventSourceRef.current = null;
        // Fall back to polling
        if (!pollTimerRef.current) {
          pollTimerRef.current = setInterval(load, POLL_INTERVAL);
        }
      });
    } catch {
      // SSE not available — poll
      pollTimerRef.current = setInterval(load, POLL_INTERVAL);
    }

    return () => {
      cancelled = true;
      eventSourceRef.current?.close();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [status]);

  if (status !== "authenticated") return null;

  async function markAllRead() {
    setUnread(0);
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
  }

  async function clickItem(id: string) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber text-bg text-[10px] font-bold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-bg shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="font-display font-bold text-ink">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-amber hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-secondary text-center">No notifications yet.</div>
            ) : (
              items.map((n) => {
                const inner = (
                  <div className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] ${n.read ? "opacity-70" : ""}`}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 inline-block w-2 h-2 rounded-full bg-amber shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{n.title}</p>
                        {n.body && <p className="text-xs text-secondary truncate">{n.body}</p>}
                      </div>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => clickItem(n.id)}>{inner}</Link>
                ) : (
                  <button key={n.id} onClick={() => clickItem(n.id)} className="block w-full text-left">{inner}</button>
                );
              })
            )}
          </div>
          <Link href="/notifications" className="block px-4 py-3 text-center text-sm text-amber hover:underline border-t border-white/10">
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
