"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntelBoxProps {
  listingId: string;
  isLocked?: boolean;
  listingAddress: string;
  listingPrice: string;
  photos?: string[];
  zipCode?: string;
  listingContext?: {
    address: string;
    city: string;
    price: number;
    sqft: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    propertyType: string;
  };
}

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>;
};

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isMock?: boolean;
};

type Question = {
  id: string;
  text: string;
  category: string;
  authorName: string;
  createdAt: string;
  upvotes: number;
  answerCount: number;
  answers: Answer[];
};

type Answer = {
  id: string;
  content: string;
  authorName: string;
  isVerifiedLocal: boolean;
  createdAt: string;
};

type Tab = "take" | "ai" | "question" | "reno";

const REACTIONS = ["🚩", "💸", "👀", "🔥", "💀"];
const REACTION_LABELS: Record<string, string> = {
  "🚩": "Red Flag",
  "💸": "Overpriced",
  "👀": "Sus",
  "🔥": "Fire",
  "💀": "Run",
};

const CONTEXT_TAGS = ["neighbor", "past renter", "drove by", "almost bought", "local"] as const;
type ContextTag = (typeof CONTEXT_TAGS)[number];

const ROLE_PROMPTS: Record<ContextTag, string[]> = {
  neighbor: [
    "What does the seller NOT want buyers to know?",
    "What's the real noise situation after 10pm?",
    "What happened to the last family that lived here?",
  ],
  "past renter": [
    "What broke first? What were they slow to fix?",
    "Would you rent here again knowing what you know?",
    "What did the landlord hide during your tour?",
  ],
  "drove by": [
    "What's the vibe on that block at 11pm?",
    "Do the listing photos match reality?",
    "What did you notice that the photos don't show?",
  ],
  "almost bought": [
    "What made you walk?",
    "What did the inspection reveal?",
    "What did your agent say off the record?",
  ],
  local: [
    "What's the one thing Zillow can't tell you?",
    "Is this block trending up or down?",
    "What do neighbors actually think about this place?",
  ],
};

const GWAKY_PROMPTS = [
  "Is this overpriced for the area?",
  "What are red flags at this price point?",
  "Compare to similar listings nearby",
];

const Q_CATEGORIES = [
  { key: "all", label: "All", icon: "" },
  { key: "property", label: "Property", icon: "🏠" },
  { key: "block", label: "Block", icon: "🏘️" },
  { key: "area", label: "Area", icon: "📍" },
  { key: "schools", label: "Schools", icon: "🎒" },
  { key: "safety", label: "Safety", icon: "🔒" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getCredibilityTag(content: string): { label: string; className: string } {
  const lower = content.toLowerCase();
  if (/\b(years?|lived here|moved|since)\b/.test(lower)) {
    return { label: "Local", className: "bg-amber-900/30 text-amber-400 border border-amber-700/40" };
  }
  if (/\b(rent|tenant|lease)\b/.test(lower)) {
    return { label: "Past Renter", className: "bg-blue-900/30 text-blue-400 border border-blue-700/40" };
  }
  if (/\b(neighbor|next door|block)\b/.test(lower)) {
    return { label: "Neighbor", className: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40" };
  }
  if (/\b(drive|visited|looked at)\b/.test(lower)) {
    return { label: "Drive-by", className: "bg-gray-700/40 text-gray-400 border border-gray-600/40 italic" };
  }
  return { label: "Anon", className: "bg-gray-700/40 text-gray-500 border border-gray-600/40" };
}

function formatMoney(n: number) { return n.toLocaleString(); }

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function parseRoleTag(content: string): { role: string | null; text: string } {
  const match = content.match(/^\[([^\]]+)\]\s*/);
  if (match) {
    return { role: match[1], text: content.slice(match[0].length) };
  }
  return { role: null, text: content };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntelBox({
  listingId,
  isLocked = false,
  listingAddress,
  listingPrice,
  photos,
  zipCode,
  listingContext,
}: IntelBoxProps) {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>("take");

  // ── Intel Feed state ──
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<ContextTag | null>(null);
  const [rolePrompt, setRolePrompt] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  // ── Join gate state ──
  const [isJoined, setIsJoined] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [reactingEmail, setReactingEmail] = useState("");
  const [showInlineAuth, setShowInlineAuth] = useState(false);
  const [showZipField, setShowZipField] = useState(false);

  // ── AI chat state ──
  const [gwakyMessages, setGwakyMessages] = useState<AIMessage[]>([]);
  const [gwakyInput, setGwakyInput] = useState("");
  const [gwakyLoading, setGwakyLoading] = useState(false);

  // ── Question state ──
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [activeQCategory, setActiveQCategory] = useState("all");
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [newQuestion, setNewQuestion] = useState("");
  const [newQCategory, setNewQCategory] = useState("area");
  const [postingQ, setPostingQ] = useState(false);
  const [postQError, setPostQError] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Estimates state ──
  type EstimateItem = { label: string; emoji: string; low: number; high: number; note: string };
  const [estimatesData, setEstimatesData] = useState<{
    estimates: EstimateItem[];
    afterRenoValueLow: number;
    afterRenoValueHigh: number;
    marketNote: string;
    source: string;
  } | null>(null);
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const estimatesFetched = useRef(false);

  // ── Toast state ──
  const [showToast, setShowToast] = useState(false);
  const [toastCopied, setToastCopied] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const gwakyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch estimates when tab opens ──
  useEffect(() => {
    if (activeTab !== "reno" || estimatesFetched.current || estimatesLoading) return;
    estimatesFetched.current = true;
    setEstimatesLoading(true);
    fetch("/api/remodel-estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        address: listingContext?.address || listingAddress,
        city: listingContext?.city || "",
        sqft: listingContext?.sqft,
        bedrooms: listingContext?.bedrooms,
        bathrooms: listingContext?.bathrooms,
        propertyType: listingContext?.propertyType,
        price: listingContext?.price,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setEstimatesData(data);
        setEstimatesLoading(false);
      })
      .catch(() => setEstimatesLoading(false));
  }, [activeTab, listingId, listingAddress, listingContext, estimatesLoading]);

  // ── Restore saved identity ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const { name: savedName, email: savedEmail, zip: savedZip } = JSON.parse(saved);
        if (savedName) setName(savedName);
        if (savedEmail) {
          setEmail(savedEmail);
          setReactingEmail(savedEmail);
        }
        if (savedZip) setZip(savedZip);
        if (savedName && savedEmail) setIsJoined(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Fetch comments ──
  useEffect(() => {
    fetch(`/api/comments?listingId=${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        setCommentsLoading(false);
      })
      .catch(() => setCommentsLoading(false));
  }, [listingId]);

  // ── Fetch questions ──
  useEffect(() => {
    if (!zipCode) {
      setQuestionsLoading(false);
      return;
    }
    const params = new URLSearchParams({ zipCode });
    params.set("listingId", listingId);
    fetch(`/api/community/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
        setQuestionsLoading(false);
      })
      .catch(() => setQuestionsLoading(false));
  }, [zipCode, listingId]);

  // ── Sorted comments (newest first) ──
  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  // ── Filtered questions ──
  const filteredQuestions = useMemo(() => {
    if (activeQCategory === "all") return questions;
    return questions.filter((q) => q.category === activeQCategory);
  }, [questions, activeQCategory]);

  // ── Auto-scroll AI messages ──
  useEffect(() => {
    gwakyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gwakyMessages]);

  // ── Join handler ──
  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsJoined(true);
    try {
      localStorage.setItem("hf_commenter", JSON.stringify({ name, email, zip }));
    } catch {
      // ignore
    }
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: `join-community-${listingId}`, name, zip: zip || undefined }),
    }).catch(() => {});
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "community_join", data: { listingId, hasZip: !!zip, source: "intelbox_gate" } }),
    }).catch(() => {});
  }

  // ── Post comment ──
  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name,
          email,
          content: selectedTag ? `[${selectedTag}] ${content}` : content,
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
        setSelectedTag(null);
        setReactingEmail(email);
        try {
          localStorage.setItem("hf_commenter", JSON.stringify({ name, email, zip }));
        } catch {
          // ignore
        }
        // Show celebration toast
        setShowToast(true);
        setToastCopied(false);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
      } else {
        const err = await res.json();
        setPostError(err.error ?? "Failed to post");
      }
    } catch {
      setPostError("Network error");
    }
    setPosting(false);
  }

  // ── React to comment ──
  const handleReact = useCallback(
    async (commentId: string, type: string) => {
      const reactEmail = reactingEmail || email;
      if (!reactEmail || !name) return;
      try {
        const res = await fetch(`/api/comments/${commentId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: reactEmail, name, type }),
        });
        if (res.ok) {
          const { reactions } = await res.json();
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? { ...c, reactions } : c))
          );
        }
      } catch {
        // silently fail
      }
    },
    [reactingEmail, email, name]
  );

  // ── Upvote question ──
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

  // ── Post question ──
  async function handlePostQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || postingQ) return;
    setPostingQ(true);
    setPostQError("");
    try {
      const res = await fetch("/api/community/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode,
          listingId,
          text: newQuestion.trim(),
          category: newQCategory,
          authorName: name || "Anonymous",
          askerEmail: email,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }
      const created = await res.json();
      setQuestions((prev) => [created, ...prev]);
      setNewQuestion("");
    } catch (err: any) {
      setPostQError(err.message);
    } finally {
      setPostingQ(false);
    }
  }

  // ── Send AI message ──
  async function sendAIMessage(
    text: string,
    setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (!text.trim()) return;
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gwaky-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          listingId,
          context: listingContext
            ? { ...listingContext, topTakes: comments.slice(0, 5).map((c) => c.content) }
            : undefined,
        }),
      });
      const data = await res.json();
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.ok ? data.response : (data.error ?? "Something went wrong. Try again!"),
        timestamp: new Date(),
        isMock: data.model === "gwaky-ai-mock",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Network error. Check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    }
    setLoading(false);
  }

  function handleCopy(msg: AIMessage, label: string) {
    const formatted = `${label} on ${listingAddress}:\n"${msg.content}"`;
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // ─── Tabs config ──────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: "take", label: "🫖 Take" },
    { key: "reno", label: "💰 Estimates" },
    { key: "ai", label: "🤖 Ask AI" },
    { key: "question", label: "👥 Ask Neighbors" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex flex-col border border-divider rounded-2xl overflow-hidden max-h-none sm:max-h-[80vh]"
      style={{
        background: "#09090B",
        minHeight: "400px",
      }}
    >
      {/* ════════ POST-TAKE CELEBRATION TOAST ════════ */}
      {showToast && (
        <div className="absolute top-3 left-3 right-3 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-900/90 border border-emerald-700/50 backdrop-blur-sm shadow-lg">
            <span className="text-sm font-semibold text-emerald-100">Your take is live! &#x1F389;</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/listing/${listingId}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setToastCopied(true);
                    setTimeout(() => setToastCopied(false), 2000);
                  });
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 transition-colors"
              >
                {toastCopied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={() => setShowToast(false)}
                className="text-emerald-300/60 hover:text-emerald-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ZONE 1 — Fixed tab header (never scrolls) ════════ */}
      <div className="shrink-0 z-10 bg-bg border-b border-divider px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-accent text-white"
                : "border border-divider text-secondary hover:text-white hover:border-secondary/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ ZONE 2 — Scrollable content area ════════ */}
      <div ref={scrollRef} className="flex-grow sm:overflow-y-auto">
        {/* ──── TAB 1: Take (Intel Feed) ──── */}
        {activeTab === "take" && (
          <div className="p-4">
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-elevated shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-elevated rounded" />
                      <div className="h-14 bg-elevated rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl mb-2">🫖</p>
                <p className="text-white font-semibold text-lg">No tea yet.</p>
                <p className="text-tertiary text-sm mt-1">
                  Be the first to drop intel on this block.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedComments.map((comment) => {
                  const { role, text: commentText } = parseRoleTag(comment.content);
                  const tag = getCredibilityTag(comment.content);
                  return (
                    <div
                      key={comment.id}
                      className="bg-surface rounded-xl p-4"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                          {getInitials(comment.name)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-white text-sm font-medium truncate">
                            {formatName(comment.name)}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tag.className}`}
                          >
                            {tag.label}
                          </span>
                          {role && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-white/60 font-medium">
                              {role}
                            </span>
                          )}
                        </div>
                        <span
                          className="ml-auto text-xs text-tertiary shrink-0"
                          title={new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        >
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {/* Take */}
                      <p className="text-ink text-sm font-semibold leading-relaxed mb-3">
                        {commentText}
                      </p>

                      {/* Reactions */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {REACTIONS.map((emoji) => {
                          const count = comment.reactions[emoji] || 0;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReact(comment.id, emoji)}
                              disabled={!isJoined}
                              title={REACTION_LABELS[emoji]}
                              aria-label={REACTION_LABELS[emoji]}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
                                count > 0
                                  ? "bg-accent/10 border border-accent/30 text-accent"
                                  : "bg-surface border border-divider text-tertiary hover:text-secondary hover:border-secondary/30"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              <span>{emoji}</span>
                              <span className="font-medium">{count}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Helpful button */}
                      <div className="mt-2">
                        <button
                          onClick={() => handleReact(comment.id, "\u2705")}
                          disabled={!isJoined}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                            (comment.reactions["\u2705"] || 0) > 0
                              ? "bg-emerald-900/20 border border-emerald-700/30 text-emerald-400"
                              : "bg-surface border border-divider text-tertiary hover:text-emerald-400 hover:border-emerald-700/30"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <span className="text-sm">&#x2713;</span>
                          <span className="font-medium">Helpful</span>
                          {(comment.reactions["\u2705"] || 0) > 0 && (
                            <span className="font-medium tabular-nums">{comment.reactions["\u2705"]}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 2: Ask AI ──── */}
        {activeTab === "ai" && (
          <div className="p-4">
            {gwakyMessages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-2xl mb-3">✨</p>
                <p className="text-white font-semibold text-lg mb-1">Ask Gwaky AI</p>
                <p className="text-tertiary text-sm mb-6">
                  Brutally honest property insights powered by AI
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {GWAKY_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() =>
                        sendAIMessage(prompt, setGwakyMessages, setGwakyInput, setGwakyLoading)
                      }
                      className="text-xs px-3 py-2 rounded-full bg-surface border border-divider text-secondary hover:text-white hover:border-accent/40 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {gwakyMessages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5">
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-white/50 mt-1 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className="border-l-[3px] border-accent bg-surface rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-accent">
                          ✨ Gwaky AI
                        </span>
                      </div>
                      <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-divider">
                        <p className="text-xs text-tertiary">{formatTime(msg.timestamp)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg, "Gwaky AI")}
                            className="flex items-center gap-1 text-xs text-tertiary hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={() => handleCopy(msg, "Gwaky AI")}
                            className="flex items-center gap-1 text-xs text-tertiary hover:text-white transition-colors"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
                {gwakyLoading && (
                  <div className="border-l-[3px] border-accent/40 rounded-xl p-4 bg-surface">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-tertiary">Gwaky is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={gwakyEndRef} />
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 3: Question ──── */}
        {activeTab === "question" && (
          <div className="p-4">
            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {Q_CATEGORIES.map((cat) => {
                const count =
                  cat.key === "all"
                    ? questions.length
                    : questions.filter((q) => q.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveQCategory(cat.key)}
                    className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                      activeQCategory === cat.key
                        ? "bg-accent text-white border-accent"
                        : "bg-surface border-divider text-secondary hover:text-white hover:border-secondary/30"
                    }`}
                  >
                    {cat.icon}{cat.icon ? " " : ""}{cat.label}
                    {count > 0 && (
                      <span className={`ml-1 text-xs ${activeQCategory === cat.key ? "text-white/70" : "text-tertiary"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {questionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface rounded-xl p-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-elevated rounded mb-3" />
                    <div className="h-3 w-1/3 bg-elevated rounded" />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-3">💬</p>
                <p className="text-white font-semibold text-lg mb-1">No questions yet</p>
                <p className="text-tertiary text-sm">
                  Be the first to ask something about this neighborhood.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => {
                  const isExpanded = expandedQId === q.id;
                  const hasUpvoted = upvoted.has(q.id);
                  const catInfo = Q_CATEGORIES.find((c) => c.key === q.category);
                  return (
                    <div
                      key={q.id}
                      className="bg-surface rounded-xl overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex gap-3">
                          {/* Upvote */}
                          <button
                            onClick={() => handleUpvote(q.id)}
                            disabled={hasUpvoted}
                            aria-label="Upvote question"
                            className={`flex flex-col items-center gap-0.5 pt-0.5 shrink-0 transition-colors ${
                              hasUpvoted
                                ? "text-accent cursor-default"
                                : "text-tertiary hover:text-white cursor-pointer"
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
                            </svg>
                            <span className="text-xs font-semibold">{q.upvotes}</span>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-ink text-sm font-medium leading-snug">
                              {q.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-xs text-secondary">{q.authorName}</span>
                              <span className="text-tertiary">·</span>
                              <span className="text-xs text-tertiary" title={new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}>{timeAgo(q.createdAt)}</span>
                              {catInfo && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface border border-divider text-secondary">
                                  {catInfo.icon} {catInfo.label}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              {q.answerCount} answer{q.answerCount !== 1 ? "s" : ""}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded answers */}
                      {isExpanded && (
                        <div className="border-t border-divider bg-surface">
                          {q.answers.length > 0 ? (
                            <div className="divide-y divide-divider">
                              {q.answers.map((a) => (
                                <div key={a.id} className="px-4 py-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-ink">{a.authorName}</span>
                                    {a.isVerifiedLocal && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-green-900/30 text-green-400 border border-green-700/40">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Local
                                      </span>
                                    )}
                                    <span className="text-xs text-tertiary" title={new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}>{timeAgo(a.createdAt)}</span>
                                  </div>
                                  <p className="text-ink text-sm leading-relaxed">{a.content}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-xs text-tertiary">No answers yet. Be the first to help out!</p>
                            </div>
                          )}

                          {/* Inline answer form */}
                          {isJoined && (
                            <div className="px-4 py-3 border-t border-divider">
                              <InlineAnswerForm
                                questionId={q.id}
                                authorName={name}
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
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 4: Estimates (AI-powered) ──── */}
        {activeTab === "reno" && (
          <div className="p-4 space-y-4">
            {estimatesLoading && !estimatesData && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-secondary text-sm">Crunching {listingContext?.city || "local"} market rates...</p>
              </div>
            )}

            {estimatesData && (
              <>
                {/* ROI Estimate */}
                <div className="bg-surface border border-accent/20 rounded-xl p-4">
                  <p className="text-secondary text-xs font-medium mb-2 uppercase tracking-wider">ROI Estimate</p>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-semibold">
                      After-Reno Value: <span className="text-accent">${formatMoney(estimatesData.afterRenoValueLow)} – ${formatMoney(estimatesData.afterRenoValueHigh)}</span>
                    </p>
                    <p className="text-tertiary text-sm">Current: ${formatMoney(listingContext?.price || 0)}</p>
                    {estimatesData.afterRenoValueLow > 0 && listingContext?.price && (
                      <p className="text-green-400 text-sm font-medium">
                        +${formatMoney(estimatesData.afterRenoValueLow - listingContext.price)} – ${formatMoney(estimatesData.afterRenoValueHigh - listingContext.price)} potential equity
                      </p>
                    )}
                  </div>
                </div>

                {/* Market note */}
                {estimatesData.marketNote && (
                  <p className="text-secondary text-xs italic px-1">{estimatesData.marketNote}</p>
                )}

                {/* Section header */}
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Remodel Estimates</p>
                  <p className="text-tertiary text-xs mb-3">
                    {estimatesData.source === "ai"
                      ? `AI-generated for ${listingContext?.city || "this area"} market rates`
                      : "Based on national averages"}
                  </p>
                </div>

                {/* Estimate cards */}
                <div className="grid gap-3">
                  {estimatesData.estimates.map((est) => (
                    <div key={est.label} className="bg-surface border border-divider rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{est.emoji}</span>
                          <span className="text-sm font-semibold text-white">{est.label}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-accent font-bold">${formatMoney(est.low)} – ${formatMoney(est.high)}</span>
                      </div>
                      <p className="text-xs text-tertiary mt-1">{est.note}</p>
                    </div>
                  ))}
                </div>

                {/* Source badge */}
                <p className="text-center text-tertiary text-xs pt-2">
                  {estimatesData.source === "ai" ? "✨ Powered by AI · Estimates only" : "📊 National averages · Estimates only"}
                </p>
              </>
            )}

            {!estimatesLoading && !estimatesData && (
              <div className="text-center py-12">
                <p className="text-secondary text-sm">Failed to load estimates.</p>
                <button
                  type="button"
                  onClick={() => { estimatesFetched.current = false; setEstimatesLoading(false); }}
                  className="text-accent text-sm mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════ ZONE 3 — Fixed bottom input bar (never scrolls) ════════ */}
      <div className="shrink-0 bg-surface border-t border-divider">
        {/* ── Take input ── */}
        {activeTab === "take" && (
          <>
            {isLocked ? (
              <div className="px-4 py-3 text-center">
                <p className="text-tertiary text-sm">
                  Comments locked — this listing is no longer active.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Context tags — always visible */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {CONTEXT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (selectedTag === tag) {
                          setSelectedTag(null);
                          setRolePrompt("");
                        } else {
                          setSelectedTag(tag);
                          const prompts = ROLE_PROMPTS[tag];
                          setRolePrompt(prompts[Math.floor(Math.random() * prompts.length)]);
                        }
                      }}
                      className={`whitespace-nowrap text-xs px-2.5 py-1 rounded-full transition-all ${
                        selectedTag === tag
                          ? "bg-accent text-white"
                          : "bg-bg border border-divider text-tertiary hover:text-secondary"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Input row — always visible */}
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      // Hide inline auth if user clears their take
                      if (!e.target.value.trim()) setShowInlineAuth(false);
                    }}
                    placeholder={rolePrompt || "Pick a role above, then spill..."}
                    className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2.5 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                  />
                  <button
                    type="button"
                    disabled={posting || !content.trim()}
                    onClick={(e) => {
                      if (isJoined) {
                        handlePost(e as unknown as React.FormEvent);
                      } else {
                        // Show inline auth — user has typed but isn't identified yet
                        setShowInlineAuth(true);
                      }
                    }}
                    className="shrink-0 px-4 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {posting ? "..." : "Drop it →"}
                  </button>
                </div>

                {/* Inline auth — only shows after user tries to post without being joined */}
                {showInlineAuth && !isJoined && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!name.trim() || !email.trim()) return;
                      // Join the user
                      setIsJoined(true);
                      setShowInlineAuth(false);
                      try {
                        localStorage.setItem("hf_commenter", JSON.stringify({ name, email, zip }));
                      } catch {
                        // ignore
                      }
                      fetch("/api/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, source: `join-community-${listingId}`, name, zip: zip || undefined }),
                      }).catch(() => {});
                      fetch("/api/analytics", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "community_join", data: { listingId, hasZip: !!zip, source: "intelbox_inline" } }),
                      }).catch(() => {});
                      // Immediately post the take
                      handlePost(e);
                    }}
                    className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-2"
                  >
                    <p className="text-white text-sm font-semibold">
                      Almost there — add your name to post
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                        required
                        autoFocus
                      />
                      <input
                        type="email"
                        placeholder="Email (private)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                        required
                      />
                    </div>
                    {showZipField && (
                      <input
                        type="text"
                        placeholder="Zip code (unlocks local badge)"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full rounded-lg bg-bg border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                      />
                    )}
                    <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-accent" />
                      Email me when someone reacts to my take
                    </label>
                    <div className="flex items-center justify-between">
                      {!showZipField && (
                        <button
                          type="button"
                          onClick={() => setShowZipField(true)}
                          className="text-xs text-tertiary hover:text-secondary transition-colors"
                        >
                          + Add zip for local badge
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!name.trim() || !email.trim()}
                        className="ml-auto px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Post take →
                      </button>
                    </div>
                  </form>
                )}

                {postError && (
                  <p className="text-red-400 text-xs">{postError}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Ask AI input ── */}
        {activeTab === "ai" && (
          <div className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={gwakyInput}
                onChange={(e) => setGwakyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage(gwakyInput, setGwakyMessages, setGwakyInput, setGwakyLoading);
                  }
                }}
                placeholder="Ask Gwaky AI anything about this property..."
                disabled={gwakyLoading}
                className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2.5 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() =>
                  sendAIMessage(gwakyInput, setGwakyMessages, setGwakyInput, setGwakyLoading)
                }
                disabled={gwakyLoading || !gwakyInput.trim()}
                aria-label="Send AI message"
                className="shrink-0 px-4 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨
              </button>
            </div>
          </div>
        )}

        {/* ── Question input ── */}
        {activeTab === "question" && (
          <div className="p-4">
            {!isJoined ? (
              <p className="text-tertiary text-sm text-center py-1">
                Drop a take first to unlock questions.
              </p>
            ) : (
              <form onSubmit={handlePostQuestion} className="space-y-2">
                {/* Category selector */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {Q_CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setNewQCategory(cat.key)}
                      className={`whitespace-nowrap text-xs px-2.5 py-1 rounded-full transition-all ${
                        newQCategory === cat.key
                          ? "bg-accent text-white"
                          : "bg-bg border border-divider text-tertiary hover:text-secondary"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask the neighborhood..."
                    maxLength={500}
                    className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2.5 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                  />
                  <button
                    type="submit"
                    disabled={postingQ || !newQuestion.trim()}
                    className="shrink-0 px-4 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {postingQ ? "..." : "Ask →"}
                  </button>
                </div>
                {postQError && (
                  <p className="text-red-400 text-xs">{postQError}</p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Inline answer form for questions */
function InlineAnswerForm({
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
        className="flex-1 min-w-0 px-3 py-2 bg-bg border border-divider rounded-lg text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
      />
      <button
        type="submit"
        disabled={posting || !content.trim()}
        className="shrink-0 px-3 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent/90 transition-all disabled:opacity-40"
      >
        {posting ? "..." : "Answer"}
      </button>
    </form>
  );
}
