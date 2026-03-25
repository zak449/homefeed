"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileComment = {
  id: string;
  content: string;
  createdAt: string;
  listing: {
    id: string;
    address: string;
    city: string;
    photo: string | null;
  } | null;
};

type ProfileQuestion = {
  id: string;
  question: string;
  category: string;
  createdAt: string;
  answerCount: number;
  listingId: string | null;
  answers: {
    id: string;
    content: string;
    authorName: string;
    isVerifiedLocal: boolean;
    createdAt: string;
  }[];
};

type ProfileAnswer = {
  id: string;
  content: string;
  createdAt: string;
  questionText: string;
  listingId: string | null;
};

type TabKey = "takes" | "questions" | "saved" | "answers";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [questions, setQuestions] = useState<ProfileQuestion[]>([]);
  const [answers, setAnswers] = useState<ProfileAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>("takes");
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  // Login form state
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginZip, setLoginZip] = useState("");

  // Load localStorage data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const { name: n, email: e, zip: z } = JSON.parse(saved);
        if (n) setName(n);
        if (e) setEmail(e);
        if (z) setZip(z);
      }
    } catch {
      // ignore
    }

    try {
      const verified = localStorage.getItem("gwaky-verified");
      if (verified) setIsVerified(true);
    } catch {
      // ignore
    }

    try {
      const savedListings = localStorage.getItem("hf_saved_listings");
      if (savedListings) {
        const parsed = JSON.parse(savedListings);
        if (Array.isArray(parsed)) setSavedIds(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch profile data from server
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`/api/profile?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.comments) setComments(data.comments);
        if (data.questions) setQuestions(data.questions);
        if (data.answers) setAnswers(data.answers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "takes", label: "My Takes", count: comments.length },
    { key: "questions", label: "Questions", count: questions.length },
    { key: "saved", label: "Saved", count: savedIds.length },
    { key: "answers", label: "Answers", count: answers.length },
  ];

  // No email — show auth entry point
  if (!email && !loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-6">🫖</div>
          <h1 className="text-white text-2xl font-extrabold mb-2 tracking-tight">
            Sign in to Gwaky
          </h1>
          <p className="text-secondary text-[15px] leading-relaxed mb-8 max-w-xs mx-auto">
            Your takes, saved listings, and notifications — all in one place.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loginEmail.trim() || !loginName.trim()) return;
              setName(loginName.trim());
              setEmail(loginEmail.trim());
              try {
                localStorage.setItem("hf_commenter", JSON.stringify({ name: loginName.trim(), email: loginEmail.trim(), zip: loginZip }));
              } catch {}
              // Subscribe for notifications
              fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail.trim(), source: "profile-login", name: loginName.trim(), zip: loginZip || undefined }),
              }).catch(() => {});
            }}
            className="space-y-3 text-left"
          >
            <input
              type="text"
              placeholder="Your name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              className="w-full rounded-xl bg-surface border border-divider px-4 py-3 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-xl bg-surface border border-divider px-4 py-3 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
              required
            />
            <input
              type="text"
              placeholder="Zip code (optional — unlocks Local badge)"
              value={loginZip}
              onChange={(e) => setLoginZip(e.target.value)}
              className="w-full rounded-xl bg-surface border border-divider px-4 py-3 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
            />
            <button
              type="submit"
              disabled={!loginEmail.trim() || !loginName.trim()}
              className="w-full py-3.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-accent/20"
            >
              Continue →
            </button>
          </form>

          <p className="text-tertiary text-xs mt-6">
            No password needed. We use your email to sync your takes and notify you when someone reacts.
          </p>

          <div className="mt-5">
            <Link href="/about" className="text-tertiary text-sm hover:text-secondary transition-colors underline underline-offset-4 decoration-[#333]">
              What is Gwaky?
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-lg font-bold text-accent shrink-0">
            {name ? getInitials(name) : "?"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-xl font-bold truncate">
                {name || "Anonymous"}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-700/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-tertiary text-sm truncate">{email}</p>
            {zip && (
              <p className="text-tertiary text-xs mt-0.5">ZIP: {zip}</p>
            )}
          </div>
        </div>

        {/* ── Tab pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-accent text-white"
                  : "bg-surface border border-divider text-secondary hover:text-white hover:border-secondary/30"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1.5 text-xs ${
                    activeTab === tab.key ? "text-white/70" : "text-tertiary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border border-divider rounded-xl p-4 animate-pulse"
              >
                <div className="h-4 w-3/4 bg-elevated rounded mb-3" />
                <div className="h-3 w-1/2 bg-elevated rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* My Takes */}
            {activeTab === "takes" && (
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <EmptyState
                    emoji="🫖"
                    title="No takes yet"
                    description="Drop your first take on a listing to see it here."
                  />
                ) : (
                  comments.map((c) => (
                    <Link
                      key={c.id}
                      href={c.listing ? `/listing/${c.listing.id}` : "/"}
                      className="block bg-surface border border-divider rounded-xl p-4 hover:border-secondary/30 transition-colors"
                    >
                      <p className="text-ink text-sm font-medium leading-relaxed mb-2">
                        {c.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-tertiary">
                        {c.listing && (
                          <>
                            <span className="text-secondary">
                              {c.listing.address}
                            </span>
                            <span className="text-divider">·</span>
                            <span>{c.listing.city}</span>
                            <span className="text-divider">·</span>
                          </>
                        )}
                        <span>{timeAgo(c.createdAt)}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Questions */}
            {activeTab === "questions" && (
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <EmptyState
                    emoji="❓"
                    title="No questions yet"
                    description="Ask a question about any neighborhood to see it here."
                  />
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-surface border border-divider rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedQId(expandedQId === q.id ? null : q.id)}
                        className="w-full text-left p-4 hover:bg-elevated/50 transition-colors"
                      >
                        <p className="text-ink text-sm font-medium leading-relaxed mb-2">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-tertiary">
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-divider text-secondary">
                            {q.category}
                          </span>
                          <span>{q.answerCount} answer{q.answerCount !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>{timeAgo(q.createdAt)}</span>
                          {q.answerCount > 0 && (
                            <span className="ml-auto text-accent text-xs">
                              {expandedQId === q.id ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </button>
                      {expandedQId === q.id && q.answers.length > 0 && (
                        <div className="border-t border-divider bg-bg/50 px-4 py-3 space-y-3">
                          {q.answers.map((a) => (
                            <div key={a.id} className="flex gap-3">
                              <div className="w-0.5 bg-accent/30 rounded-full shrink-0" />
                              <div>
                                <p className="text-ink text-sm leading-relaxed">{a.content}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-tertiary">
                                  <span>{a.authorName}</span>
                                  {a.isVerifiedLocal && (
                                    <span className="text-green-400 text-xs">✓ Verified</span>
                                  )}
                                  <span>· {timeAgo(a.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Saved */}
            {activeTab === "saved" && (
              <div className="space-y-3">
                {savedIds.length === 0 ? (
                  <EmptyState
                    emoji="❤️"
                    title="No saved listings"
                    description="Tap the heart on any listing to save it here."
                  />
                ) : (
                  savedIds.map((id) => (
                    <Link
                      key={id}
                      href={`/listing/${id}`}
                      className="block bg-surface border border-divider rounded-xl p-4 hover:border-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center text-tertiary">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-ink text-sm font-medium">
                            Saved Listing
                          </p>
                          <p className="text-tertiary text-xs">
                            Tap to view →
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Answers */}
            {activeTab === "answers" && (
              <div className="space-y-3">
                {answers.length === 0 ? (
                  <EmptyState
                    emoji="💬"
                    title="No answers yet"
                    description="Answer a neighbor's question to see it here."
                  />
                ) : (
                  answers.map((a) => (
                    <Link
                      key={a.id}
                      href={
                        a.listingId ? `/listing/${a.listingId}` : "/"
                      }
                      className="block bg-surface border border-divider rounded-xl p-4 hover:border-secondary/30 transition-colors"
                    >
                      <p className="text-secondary text-xs mb-1 italic">
                        Q: {a.questionText}
                      </p>
                      <p className="text-ink text-sm font-medium leading-relaxed mb-2">
                        {a.content}
                      </p>
                      <span className="text-xs text-tertiary">
                        {timeAgo(a.createdAt)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-2xl mb-2">{emoji}</p>
      <p className="text-white font-semibold text-lg">{title}</p>
      <p className="text-tertiary text-sm mt-1">{description}</p>
    </div>
  );
}
