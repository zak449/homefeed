"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

const LS_DISMISSED_KEY = "gwaky_sticky_cta_dismissed";
const LS_SUBSCRIBED_KEY = "gwaky_subscribed_email";

export default function StickyEmailCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const wasDismissed = localStorage.getItem(LS_DISMISSED_KEY);
    const alreadySubscribed = localStorage.getItem(LS_SUBSCRIBED_KEY);

    if (wasDismissed || alreadySubscribed) {
      setDismissed(true);
      return;
    }

    setDismissed(false);
  }, []);

  // IntersectionObserver: show after scrolling past the fold
  useEffect(() => {
    if (dismissed) return;

    // Create a sentinel element at the fold (100vh from top)
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel leaves viewport (scrolled past fold), show the bar
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dismissed]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "sticky" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong.");
        return;
      }

      setStatus("success");
      localStorage.setItem(LS_SUBSCRIBED_KEY, email);

      // Auto-hide after a brief moment
      setTimeout(() => setDismissed(true), 2500);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(LS_DISMISSED_KEY, "1");
  }

  return (
    <>
      {/* Invisible sentinel placed at the fold height */}
      <div
        ref={sentinelRef}
        className="absolute top-[100vh] left-0 w-px h-px pointer-events-none"
        aria-hidden="true"
      />

      {/* Sticky bar */}
      {!dismissed && (
        <div
          className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-500 ease-out ${
            visible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="bg-white border-t border-border shadow-modal">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center gap-3">
              {/* Copy */}
              <p className="text-sm text-ink font-medium text-center sm:text-left flex-1 min-w-0">
                <span className="text-social font-semibold">Join the conversation</span>
                {" "}— get listing alerts and hot takes in your inbox.
              </p>

              {status === "success" ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-money shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-ink">You&apos;re in!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 shrink-0"
                >
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-48 sm:w-56 px-3.5 py-2 text-sm rounded-xl border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/30 focus:border-social transition-colors"
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
              )}

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="shrink-0 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-tag transition-colors"
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
