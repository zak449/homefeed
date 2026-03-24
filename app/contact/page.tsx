"use client";

import { useState, type FormEvent } from "react";

const subjects = [
  "General Inquiry",
  "Report Inappropriate Content",
  "Bug Report",
  "Feature Request",
  "Listing Data Issue",
  "Press / Media",
  "Partnership Opportunity",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to send message");
    }
  };

  return (
    <>
      <title>Contact Us — gwakgwak</title>
      <meta
        name="description"
        content="Get in touch with the gwakgwak team. We'd love to hear from you."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to gwakgwak
        </a>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-3">
            Contact
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            We&rsquo;d love to hear from you
          </h1>
          <p className="text-base text-secondary mt-3 leading-relaxed max-w-lg">
            Have a question, feedback, or just want to say hi? Fill out the form
            below or reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="bg-glow border border-amber/10 rounded-2xl p-8 sm:p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <p className="font-display text-xl font-bold text-ink mb-2">
                  Message sent!
                </p>
                <p className="text-sm text-secondary mt-2 max-w-sm mx-auto">
                  Thanks for reaching out. We typically respond within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm font-semibold text-amber hover:text-amber/80 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[13px] font-semibold text-ink mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-divider rounded-xl text-[15px] text-ink bg-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[13px] font-semibold text-ink mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-divider rounded-xl text-[15px] text-ink bg-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[13px] font-semibold text-ink mb-1.5"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border border-divider rounded-xl text-[15px] bg-surface focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber transition-colors ${
                      form.subject ? "text-ink" : "text-tertiary"
                    }`}
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[13px] font-semibold text-ink mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-divider rounded-xl text-[15px] text-ink bg-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber transition-colors resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                {/* Error message */}
                {status === "error" && (
                  <p className="text-sm text-red-500 font-medium">
                    {errorMessage}
                  </p>
                )}

                {/* Submit + response time */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full sm:w-auto bg-amber text-white text-sm font-bold px-8 py-3 rounded-xl shadow-glow hover:shadow-glow-amber hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>
                  <p className="text-[12px] text-tertiary flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    We typically respond within 24 hours
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Direct contact */}
            <div className="bg-highlight rounded-2xl p-5">
              <h3 className="font-display text-sm font-bold text-ink mb-3">
                Direct Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-0.5">
                    Support
                  </p>
                  <a
                    href="mailto:support@gwakgwak.app"
                    className="text-[14px] text-amber hover:text-amber/80 font-semibold transition-colors"
                  >
                    support@gwakgwak.app
                  </a>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-0.5">
                    Privacy
                  </p>
                  <a
                    href="mailto:privacy@gwakgwak.app"
                    className="text-[14px] text-amber hover:text-amber/80 font-semibold transition-colors"
                  >
                    privacy@gwakgwak.app
                  </a>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-highlight rounded-2xl p-5">
              <h3 className="font-display text-sm font-bold text-ink mb-3">
                Follow Us
              </h3>
              <div className="space-y-2.5">
                <a
                  href="https://twitter.com/gwakgwakapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-secondary hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-divider flex items-center justify-center group-hover:border-amber/30 transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  X (Twitter)
                </a>
                <a
                  href="https://instagram.com/gwakgwakapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-secondary hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-divider flex items-center justify-center group-hover:border-amber/30 transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@gwakgwakapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-secondary hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-divider flex items-center justify-center group-hover:border-amber/30 transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.79a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                  TikTok
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-highlight rounded-2xl p-5">
              <h3 className="font-display text-sm font-bold text-ink mb-3">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href="/faq"
                  className="block text-[14px] text-secondary hover:text-ink font-medium transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="/privacy"
                  className="block text-[14px] text-secondary hover:text-ink font-medium transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="block text-[14px] text-secondary hover:text-ink font-medium transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
