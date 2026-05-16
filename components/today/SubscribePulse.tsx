"use client";

/**
 * SubscribePulse — bottom-of-page CTA on /today.
 *
 * Posts to /api/subscribe with { email, source: "today" }. Shows an inline
 * confirmation on success and a soft error otherwise. No external deps —
 * just fetch + useState.
 */

import { useState, type FormEvent } from "react";

export default function SubscribePulse() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "today" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Couldn't sign you up");
      }
      setState("ok");
      setMsg("You're on the list. See you tomorrow.");
      setEmail("");
    } catch (err) {
      setState("err");
      setMsg(err instanceof Error ? err.message : "Something broke. Try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-surface border border-divider p-5 sm:p-6"
    >
      <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber mb-2">
        Return tomorrow
      </p>
      <h3 className="text-xl sm:text-2xl font-extrabold text-ink leading-tight mb-1">
        Don&apos;t miss tomorrow&apos;s tea.
      </h3>
      <p className="text-sm text-secondary mb-4 leading-relaxed">
        One email a day. The takes, the listings, the drama. Unsubscribe whenever.
      </p>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="today-email">
          Email
        </label>
        <input
          id="today-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@yourblock.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading" || state === "ok"}
          className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-bg border border-divider text-ink text-sm placeholder:text-tertiary focus:outline-none focus:border-amber/60 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "ok"}
          className="shrink-0 px-4 py-3 rounded-xl bg-amber text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {state === "loading" ? "Saving…" : state === "ok" ? "On it ✓" : "Subscribe"}
        </button>
      </div>
      {msg && (
        <p
          className={`mt-3 text-xs font-medium ${
            state === "ok" ? "text-amber" : "text-red-flag"
          }`}
          role="status"
        >
          {msg}
        </p>
      )}
    </form>
  );
}
