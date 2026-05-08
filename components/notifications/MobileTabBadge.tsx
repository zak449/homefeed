"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const POLL_INTERVAL = 30_000;

/**
 * Small badge that displays the unread notification count next to a
 * mobile bottom-tab icon. Returns null when the user is signed out
 * or has no unread notifications.
 */
export function MobileTabBadge({ className = "" }: { className?: string }) {
  const { status } = useSession();
  const [unread, setUnread] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setUnread(0);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/notifications?limit=1");
        if (!r.ok) return;
        const j = await r.json();
        if (cancelled) return;
        setUnread(j.unread ?? 0);
      } catch { /* ignore */ }
    }
    load();
    try {
      const es = new EventSource("/api/notifications/stream");
      esRef.current = es;
      es.addEventListener("notification", () => load());
      es.addEventListener("error", () => {
        es.close();
        esRef.current = null;
        if (!pollRef.current) pollRef.current = setInterval(load, POLL_INTERVAL);
      });
    } catch {
      pollRef.current = setInterval(load, POLL_INTERVAL);
    }
    return () => {
      cancelled = true;
      esRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status]);

  if (status !== "authenticated" || unread <= 0) return null;
  return (
    <span
      className={
        "absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-amber text-bg text-[9px] font-bold " +
        className
      }
      aria-label={`${unread} unread notifications`}
    >
      {unread > 99 ? "99+" : unread}
    </span>
  );
}
