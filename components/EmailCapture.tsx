"use client";

import { useState, useEffect, FormEvent } from "react";

type Variant = "hero" | "inline" | "footer";

interface EmailCaptureProps {
  variant?: Variant;
  source?: string;
}

const LS_KEY = "gwakgwak_subscribed_email";

export default function EmailCapture({
  variant = "inline",
  source,
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setAlreadySubscribed(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...(phone ? { phone } : {}),
          source: source ?? variant,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong.");
        return;
      }

      setStatus("success");
      localStorage.setItem(LS_KEY, email);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  // Don't render if already subscribed
  if (alreadySubscribed && status !== "success") return null;

  // ── Success state ────────────────────────────────────────
  if (status === "success") {
    return (
      <div
        className={`flex items-center gap-2 ${
          variant === "hero" ? "justify-center py-4" : "py-2"
        }`}
      >
        <svg
          className="w-5 h-5 text-money shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium text-ink">
          You&apos;re in! Check your inbox.
        </span>
      </div>
    );
  }

  // ── Hero variant ─────────────────────────────────────────
  if (variant === "hero") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <h3 className="font-display text-xl font-bold text-ink tracking-tighter mb-1">
          Get the inside scoop.
        </h3>
        <p className="text-sm text-muted mb-4">
          New listings, hot takes, and neighborhood opinions — straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/30 focus:border-social transition-colors"
            />
            <input
              type="tel"
              placeholder="Phone (optional, for SMS)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/30 focus:border-social transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-button transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FF6B2C" }}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>

          {status === "error" && (
            <p className="text-xs text-hot">{errorMsg}</p>
          )}

          <p className="text-2xs text-muted/60">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      </div>
    );
  }

  // ── Inline variant ───────────────────────────────────────
  if (variant === "inline") {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 w-full max-w-md"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 px-3.5 py-2 text-sm rounded-xl border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/30 focus:border-social transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-button transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FF6B2C" }}
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>

        {status === "error" && (
          <p className="text-xs text-hot whitespace-nowrap">{errorMsg}</p>
        )}
      </form>
    );
  }

  // ── Footer variant ───────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-48 px-3 py-1.5 text-xs rounded-lg border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/30 focus:border-social transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-button transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#FF6B2C" }}
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>

      {status === "error" && (
        <p className="text-2xs text-hot">{errorMsg}</p>
      )}
    </form>
  );
}
