"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Item {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const PAGE_SIZE = 25;

export function NotificationsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (loading || done) return;
    setLoading(true);
    try {
      const url = new URL("/api/notifications", window.location.origin);
      url.searchParams.set("limit", String(PAGE_SIZE));
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      const next = json.items as Item[];
      setItems((prev) => [...prev, ...next]);
      if (next.length < PAGE_SIZE) setDone(true);
      else setCursor(next[next.length - 1].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMore(); /* initial */ /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // IntersectionObserver to auto-load more
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, done, loading]);

  return (
    <div className="mt-6">
      {items.length === 0 && !loading && (
        <div className="text-sm text-secondary">You&rsquo;re all caught up.</div>
      )}
      <ul className="space-y-2">
        {items.map((n) => {
          const body = (
            <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${n.read ? "opacity-70" : ""}`}>
              <div className="flex items-start gap-2">
                {!n.read && <span className="mt-1.5 inline-block w-2 h-2 rounded-full bg-amber shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  {n.body && <p className="text-xs text-secondary mt-1">{n.body}</p>}
                  <p className="text-[11px] text-secondary mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
          return (
            <li key={n.id}>
              {n.link ? <Link href={n.link}>{body}</Link> : body}
            </li>
          );
        })}
      </ul>
      <div ref={sentinelRef} className="h-12 flex items-center justify-center">
        {loading && <span className="text-xs text-secondary">Loading…</span>}
        {done && items.length > 0 && <span className="text-xs text-secondary">— end —</span>}
      </div>
    </div>
  );
}
