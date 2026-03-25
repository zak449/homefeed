"use client";

import { useState } from "react";

export default function CareersWaitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "careers" }),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm text-white font-semibold">
            You&apos;re on the list! We&apos;ll be in touch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 text-sm font-semibold bg-[#1A1A1A] text-white rounded-lg hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "Joining..." : "Join Waitlist"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-white/70 mt-2 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
