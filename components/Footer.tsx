"use client";

import Link from "next/link";
import { useState } from "react";
import Turnstile from "./Turnstile";

const NAV_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Browse", href: "/" },
      { label: "Trending", href: "/?sort=comments" },
      { label: "Saved", href: "/saved" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", ...(turnstileToken ? { turnstileToken } : {}) }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main footer content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-lg font-bold tracking-tight">
              Gwak<span className="text-[#E8A87C]">y</span>
            </p>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              the comment section real estate never had
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white/40 hover:text-[#E8A87C] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-4 grid grid-cols-3 gap-6">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Stay in the loop
            </p>
            <p className="text-sm text-white/60">
              Get notified about trending listings and the hottest takes.
            </p>
            <Turnstile onVerify={setTurnstileToken} size="compact" />
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8A87C]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#E8A87C] text-ink hover:bg-[#E8A87C]/90 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
            {status === "success" && (
              <p className="text-xs text-[#E8A87C]">You&apos;re subscribed!</p>
            )}
            {status === "error" && (
              <p className="text-xs text-red-400">Something went wrong. Try again.</p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; 2026 Gwaky. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Made with honesty in California
          </p>
        </div>
      </div>
    </footer>
  );
}
