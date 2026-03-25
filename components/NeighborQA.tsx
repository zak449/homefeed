"use client";

import { useEffect, useState, useCallback } from "react";

type Category = "all" | "property" | "block" | "area" | "schools" | "safety";

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "" },
  { key: "property", label: "About this property", icon: "🏠" },
  { key: "block", label: "About this block", icon: "🏘️" },
  { key: "area", label: "About this area", icon: "📍" },
  { key: "schools", label: "Schools & families", icon: "🎒" },
  { key: "safety", label: "Safety & noise", icon: "🔒" },
];

type Answer = {
  id: string;
  content: string;
  authorName: string;
  isVerifiedLocal: boolean;
  createdAt: string;
};

type Question = {
  id: string;
  text: string;
  category: Category;
  authorName: string;
  createdAt: string;
  upvotes: number;
  answerCount: number;
  answers: Answer[];
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export default function NeighborQA({
  zipCode,
  listingId,
}: {
  zipCode: string;
  listingId?: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  // New question form
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("area");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  // Check verification status
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gwaky-verified");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.zipCode && parsed?.name) {
          setIsVerified(true);
          setVerifiedName(parsed.name);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch questions
  useEffect(() => {
    const params = new URLSearchParams({ zipCode });
    if (listingId) params.set("listingId", listingId);

    fetch(`/api/community/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [zipCode, listingId]);

  const filtered =
    activeCategory === "all"
      ? questions
      : questions.filter((q) => q.category === activeCategory);

  const handleUpvote = useCallback(
    async (questionId: string) => {
      if (upvoted.has(questionId)) return;
      setUpvoted((prev) => new Set(prev).add(questionId));
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
        )
      );
      try {
        await fetch(`/api/community/questions/${questionId}/upvote`, {
          method: "POST",
        });
      } catch {
        // revert on failure
        setUpvoted((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, upvotes: q.upvotes - 1 } : q
          )
        );
      }
    },
    [upvoted]
  );

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch("/api/community/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode,
          listingId,
          text: newQuestion.trim(),
          category: newCategory,
          authorName: verifiedName || "Anonymous",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }
      const created = await res.json();
      setQuestions((prev) => [created, ...prev]);
      setNewQuestion("");
      setShowForm(false);
    } catch (err: any) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-headline text-ink">Ask the neighborhood</h2>
          <p className="text-caption text-secondary mt-0.5">
            Real answers from verified locals
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-ink text-bg text-caption font-medium rounded-button hover:bg-ink/90 transition-colors"
        >
          Ask a question
        </button>
      </div>

      {/* Ask form */}
      {showForm && (
        <div className="mb-6 bg-surface border border-divider rounded-card p-5 animate-fade-in">
          <form onSubmit={handlePost} className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What do you want to know about this neighborhood?"
              rows={3}
              maxLength={500}
              className="w-full rounded-card border border-divider bg-bg px-3 py-2.5 text-body text-ink placeholder:text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-amber/30 transition-colors"
            />

            {/* Category selector */}
            <div>
              <label className="text-caption text-secondary block mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setNewCategory(cat.key as Category)}
                    className={`text-caption px-3 py-1.5 rounded-full border transition-colors ${
                      newCategory === cat.key
                        ? "bg-ink text-bg border-ink"
                        : "bg-bg border-divider text-secondary hover:text-ink hover:border-tertiary/40"
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {postError && (
              <p className="text-caption text-red-400 bg-red-900/30 border border-red-700/40 rounded-lg px-3 py-2">
                {postError}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-caption text-tertiary">
                {newQuestion.length}/500
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-caption text-secondary hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting || !newQuestion.trim()}
                  className="px-5 py-2 bg-ink text-bg text-caption font-medium rounded-button hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post question"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === "all"
              ? questions.length
              : questions.filter((q) => q.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`whitespace-nowrap text-caption px-3.5 py-1.5 rounded-full border transition-all shrink-0 ${
                activeCategory === cat.key
                  ? "bg-ink text-bg border-ink"
                  : "bg-surface border-divider text-secondary hover:text-ink hover:border-tertiary/40"
              }`}
            >
              {cat.icon}{cat.icon ? " " : ""}{cat.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs ${
                    activeCategory === cat.key ? "text-white/70" : "text-tertiary"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-divider rounded-card p-5"
            >
              <div className="h-4 w-3/4 skeleton rounded mb-3" />
              <div className="h-3 w-1/3 skeleton rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 rounded-card bg-surface border border-divider">
          <p className="text-2xl mb-3">💬</p>
          <p className="text-title text-ink mb-1">No questions yet</p>
          <p className="text-body text-secondary">
            Be the first to ask something about this neighborhood.
          </p>
        </div>
      )}

      {/* Questions list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            const hasUpvoted = upvoted.has(q.id);

            return (
              <div
                key={q.id}
                className="bg-surface border border-divider rounded-card overflow-hidden transition-shadow hover:shadow-soft"
              >
                {/* Question row */}
                <div className="p-4 sm:p-5">
                  <div className="flex gap-3">
                    {/* Upvote button */}
                    <button
                      onClick={() => handleUpvote(q.id)}
                      disabled={hasUpvoted}
                      className={`flex flex-col items-center gap-0.5 pt-0.5 shrink-0 transition-colors ${
                        hasUpvoted
                          ? "text-amber cursor-default"
                          : "text-tertiary hover:text-ink cursor-pointer"
                      }`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={hasUpvoted ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                      </svg>
                      <span className="text-xs font-semibold">
                        {q.upvotes}
                      </span>
                    </button>

                    {/* Question content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-ink font-medium leading-snug">
                        {q.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-caption text-secondary">
                          {q.authorName}
                        </span>
                        <span className="text-tertiary">·</span>
                        <span className="text-caption text-tertiary">
                          {timeAgo(q.createdAt)}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            {
                              property: "bg-blue-900/30 text-blue-400 border border-blue-700/40",
                              block: "bg-purple-900/30 text-purple-400 border border-purple-700/40",
                              area: "bg-green-900/30 text-green-400 border border-green-700/40",
                              schools: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40",
                              safety: "bg-red-900/30 text-red-400 border border-red-700/40",
                              all: "bg-highlight text-secondary border border-divider",
                            }[q.category]
                          }`}
                        >
                          {CATEGORIES.find((c) => c.key === q.category)?.icon}{" "}
                          {CATEGORIES.find((c) => c.key === q.category)?.label}
                        </span>
                      </div>

                      {/* Answer count / expand trigger */}
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : q.id)
                        }
                        className="mt-2.5 flex items-center gap-1.5 text-caption font-medium text-amber hover:text-amber/80 transition-colors"
                      >
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
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {q.answerCount} answer{q.answerCount !== 1 ? "s" : ""}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded answers */}
                {isExpanded && (
                  <div className="border-t border-divider bg-highlight/50">
                    {q.answers.length > 0 ? (
                      <div className="divide-y divide-divider">
                        {q.answers.map((a) => (
                          <div key={a.id} className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-caption font-medium text-ink">
                                {a.authorName}
                              </span>
                              {a.isVerifiedLocal && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-green-900/30 text-green-400 border border-green-700/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  Verified Local
                                </span>
                              )}
                              <span className="text-caption text-tertiary">
                                {timeAgo(a.createdAt)}
                              </span>
                            </div>
                            <p className="text-body text-ink/90 leading-relaxed">
                              {a.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-6 text-center">
                        <p className="text-caption text-secondary">
                          No answers yet. Be the first to help out!
                        </p>
                      </div>
                    )}

                    {/* Answer prompt */}
                    <div className="px-5 py-4 border-t border-divider">
                      {isVerified ? (
                        <AnswerForm
                          questionId={q.id}
                          authorName={verifiedName}
                          onAnswered={(answer) => {
                            setQuestions((prev) =>
                              prev.map((question) =>
                                question.id === q.id
                                  ? {
                                      ...question,
                                      answerCount: question.answerCount + 1,
                                      answers: [...question.answers, answer],
                                    }
                                  : question
                              )
                            );
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2.5 py-1">
                          <div className="w-6 h-6 rounded-full bg-highlight border border-divider flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="text-tertiary"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <p className="text-caption text-secondary">
                            Only verified locals can answer questions.{" "}
                            <a
                              href={`/community/${zipCode}`}
                              className="text-amber font-medium hover:underline"
                            >
                              Verify your address
                            </a>{" "}
                            to join the conversation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Inline answer form for verified users */
function AnswerForm({
  questionId,
  authorName,
  onAnswered,
}: {
  questionId: string;
  authorName: string;
  onAnswered: (answer: Answer) => void;
}) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(
        `/api/community/questions/${questionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim(), authorName }),
        }
      );
      if (res.ok) {
        const answer = await res.json();
        onAnswered(answer);
        setContent("");
      }
    } catch {
      // silently fail
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share what you know..."
        maxLength={500}
        className="flex-1 min-w-0 px-3 py-2 bg-bg border border-divider rounded-button text-body text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30 transition-colors"
      />
      <button
        type="submit"
        disabled={posting || !content.trim()}
        className="shrink-0 px-4 py-2 bg-ink text-bg text-caption font-medium rounded-button hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {posting ? "..." : "Answer"}
      </button>
    </form>
  );
}
