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
      <title>Contact Us — homefeed</title>
      <meta
        name="description"
        content="Get in touch with the homefeed team. We'd love to hear from you."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
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
          Back to homefeed
        </a>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter">
            Get in Touch
          </h1>
          <p className="text-base text-muted mt-3 leading-relaxed max-w-lg">
            Have a question, feedback, or just want to say hi? Fill out the form
            below or reach out directly. We&rsquo;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="bg-social-light border border-social/10 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">&#x2709;&#xFE0F;</div>
                <p className="font-display text-lg font-semibold text-ink">
                  Message sent!
                </p>
                <p className="text-sm text-muted mt-2">
                  Thanks for reaching out. We&rsquo;ll get back to you as soon
                  as we can.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-5 text-sm font-semibold text-social hover:text-social/80 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-[15px] text-ink bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/20 focus:border-social transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-[15px] text-ink bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/20 focus:border-social transition-colors"
                    placeholder="you@example.com"
                  />
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
                    className={`w-full px-4 py-2.5 border border-border rounded-lg text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-social/20 focus:border-social transition-colors ${
                      form.subject ? "text-ink" : "text-muted/50"
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-[15px] text-ink bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-social/20 focus:border-social transition-colors resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                {/* Error message */}
                {status === "error" && (
                  <p className="text-sm text-red-500 font-medium">
                    {errorMessage}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full sm:w-auto bg-social text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-social/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Direct contact */}
            <div className="bg-tag rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-ink mb-3">
                Direct Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-0.5">
                    Support
                  </p>
                  <a
                    href="mailto:support@homefeed.app"
                    className="text-[14px] text-social hover:text-social/80 font-medium transition-colors"
                  >
                    support@homefeed.app
                  </a>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-0.5">
                    Privacy
                  </p>
                  <a
                    href="mailto:privacy@homefeed.app"
                    className="text-[14px] text-social hover:text-social/80 font-medium transition-colors"
                  >
                    privacy@homefeed.app
                  </a>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-tag rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-ink mb-3">
                Follow Us
              </h3>
              <div className="space-y-2.5">
                <a
                  href="https://twitter.com/homefeedapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-muted hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center group-hover:border-ink/20 transition-colors">
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
                  href="https://instagram.com/homefeedapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-muted hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center group-hover:border-ink/20 transition-colors">
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
                  href="https://tiktok.com/@homefeedapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-muted hover:text-ink font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center group-hover:border-ink/20 transition-colors">
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
            <div className="bg-tag rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-ink mb-3">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href="/faq"
                  className="block text-[14px] text-muted hover:text-ink font-medium transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="/privacy"
                  className="block text-[14px] text-muted hover:text-ink font-medium transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="block text-[14px] text-muted hover:text-ink font-medium transition-colors"
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
