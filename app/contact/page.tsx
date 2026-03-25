"use client";

import { useState } from "react";

const CATEGORIES = [
  "General",
  "Report a Take",
  "Press",
  "Partnerships",
  "Bug Report",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setCategory("General");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-[720px] mx-auto px-5 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Contact Us
        </h1>
        <p className="text-white/60 text-sm mb-10">
          We typically respond within 2 business days.
        </p>

        {status === "success" ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center">
            <p className="text-2xl mb-3">{"\u2705"}</p>
            <p className="text-white font-semibold text-lg mb-1">Message sent</p>
            <p className="text-white/60 text-sm">
              We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50 transition-colors appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-[#2A2A2A]">
          <p className="text-white/40 text-sm">
            You can also reach us directly at{" "}
            <a
              href="mailto:hello@gwaky.com"
              className="text-[#FF4D00] hover:underline"
            >
              hello@gwaky.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
