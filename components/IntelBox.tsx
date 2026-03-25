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

type RenoResult = {
  imageUrl: string | null;
  estimateLow: number;
  estimateHigh: number;
  materials: { item: string; brand: string; priceRange: string }[];
  renovationType: string;
  style: string;
  isMock?: boolean;
};

const RENO_TYPES = [
  { key: "kitchen", label: "Kitchen" },
  { key: "exterior", label: "Exterior" },
  { key: "master-bath", label: "Master Bath" },
  { key: "landscaping", label: "Landscaping" },
  { key: "adu", label: "ADU" },
  { key: "full-gut", label: "Full Gut" },
] as const;

const RENO_STYLES = [
  { key: "modern", label: "Modern" },
  { key: "mediterranean", label: "Mediterranean" },
  { key: "coastal", label: "Coastal" },
  { key: "mid-century", label: "Mid-Century" },
  { key: "farmhouse", label: "Farmhouse" },
] as const;

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
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  // ── Join gate state ──
  const [isJoined, setIsJoined] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [reactingEmail, setReactingEmail] = useState("");

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

  // ── Reno state ──
  const [renoType, setRenoType] = useState("kitchen");
  const [renoStyle, setRenoStyle] = useState("modern");
  const [renoLoading, setRenoLoading] = useState(false);
  const [renoResult, setRenoResult] = useState<RenoResult | null>(null);
  const [renoError, setRenoError] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Refs ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const gwakyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // ── Generate reno vision ──
  async function handleGenerateReno() {
    if (renoLoading) return;
    setRenoLoading(true);
    setRenoError("");
    setRenoResult(null);
    try {
      const res = await fetch("/api/reno-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          renovationType: renoType,
          style: renoStyle,
          listingAddress,
          listingPhoto: photos?.[0] ?? null,
          listingPrice,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate vision");
      }
      const result: RenoResult = await res.json();
      setRenoResult(result);
    } catch (err: unknown) {
      setRenoError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRenoLoading(false);
    }
  }

  function handleSaveRenoVision() {
    if (!renoResult) return;
    try {
      const saved = localStorage.getItem("gwaky_saved_reno_visions");
      const visions = saved ? JSON.parse(saved) : [];
      visions.push({
        ...renoResult,
        listingId,
        listingAddress,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem("gwaky_saved_reno_visions", JSON.stringify(visions));
    } catch {
      // ignore
    }
  }

  function handlePostRenoAsTake() {
    if (!renoResult) return;
    const low = renoResult.estimateLow.toLocaleString();
    const high = renoResult.estimateHigh.toLocaleString();
    const label = RENO_TYPES.find((t) => t.key === renoResult.renovationType)?.label ?? renoResult.renovationType;
    const styleLabel = RENO_STYLES.find((s) => s.key === renoResult.style)?.label ?? renoResult.style;
    setContent(`[Reno Vision] ${styleLabel} ${label} reno would cost $${low}–$${high}. Top materials: ${renoResult.materials.slice(0, 3).map((m) => `${m.brand} ${m.item}`).join(", ")}.`);
    setActiveTab("take");
  }

  // ─── Tabs config ──────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: "take", label: "🫖 Take" },
    { key: "reno", label: "✨ Vision" },
    { key: "ai", label: "🤖 Ask AI" },
    { key: "question", label: "❓ Question" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex flex-col border border-[#2A2A2A] rounded-2xl overflow-hidden"
      style={{
        background: "#0E0E0E",
        minHeight: "600px",
        maxHeight: "80vh",
      }}
    >
      {/* ════════ ZONE 1 — Sticky tab header ════════ */}
      <div className="sticky top-0 z-10 bg-[#0E0E0E] border-b border-[#2A2A2A] px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#FF4D00] text-white"
                : "border border-[#2A2A2A] text-[#888888] hover:text-white hover:border-[#444]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ ZONE 2 — Scrollable content area ════════ */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto">
        {/* ──── TAB 1: Take (Intel Feed) ──── */}
        {activeTab === "take" && (
          <div className="p-4">
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[#222] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-[#222] rounded" />
                      <div className="h-14 bg-[#222] rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl mb-2">🫖</p>
                <p className="text-white font-semibold text-lg">No tea yet.</p>
                <p className="text-[#666] text-sm mt-1">
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
                      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#FF4D00]/15 flex items-center justify-center text-[11px] font-bold text-[#FF4D00] shrink-0">
                          {getInitials(comment.name)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-white text-sm font-medium truncate">
                            {formatName(comment.name)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tag.className}`}
                          >
                            {tag.label}
                          </span>
                          {role && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 text-white/60 font-medium">
                              {role}
                            </span>
                          )}
                        </div>
                        <span className="ml-auto text-[11px] text-[#555] shrink-0">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {/* Take */}
                      <p className="text-[#E0E0E0] text-sm font-semibold leading-relaxed mb-3">
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
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
                                count > 0
                                  ? "bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#FF4D00]"
                                  : "bg-[#1F1F1F] border border-[#2A2A2A] text-[#555] hover:text-[#888] hover:border-[#444]"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && (
                                <span className="font-medium">{count}</span>
                              )}
                            </button>
                          );
                        })}
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
                <p className="text-[#666] text-sm mb-6">
                  Brutally honest property insights powered by AI
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {GWAKY_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() =>
                        sendAIMessage(prompt, setGwakyMessages, setGwakyInput, setGwakyLoading)
                      }
                      className="text-xs px-3 py-2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#999] hover:text-white hover:border-[#FF4D00]/40 transition-all"
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
                      <div className="max-w-[85%] bg-[#FF4D00] text-white rounded-2xl rounded-br-md px-4 py-2.5">
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] text-white/50 mt-1 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className="border-l-[3px] border-[#FF4D00] bg-[#1A1A1A] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-[#FF4D00]">
                          ✨ Gwaky AI
                        </span>
                      </div>
                      <p className="text-[#E0E0E0] text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2A2A2A]">
                        <p className="text-[10px] text-[#555]">{formatTime(msg.timestamp)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg, "Gwaky AI")}
                            className="flex items-center gap-1 text-[11px] text-[#555] hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={() => handleCopy(msg, "Gwaky AI")}
                            className="flex items-center gap-1 text-[11px] text-[#555] hover:text-white transition-colors"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
                {gwakyLoading && (
                  <div className="border-l-[3px] border-[#FF4D00]/40 rounded-xl p-4 bg-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-[#555]">Gwaky is thinking...</span>
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
                        ? "bg-[#FF4D00] text-white border-[#FF4D00]"
                        : "bg-[#1A1A1A] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
                    }`}
                  >
                    {cat.icon}{cat.icon ? " " : ""}{cat.label}
                    {count > 0 && (
                      <span className={`ml-1 text-[10px] ${activeQCategory === cat.key ? "text-white/70" : "text-[#555]"}`}>
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
                  <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-[#222] rounded mb-3" />
                    <div className="h-3 w-1/3 bg-[#222] rounded" />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-3">💬</p>
                <p className="text-white font-semibold text-lg mb-1">No questions yet</p>
                <p className="text-[#666] text-sm">
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
                      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex gap-3">
                          {/* Upvote */}
                          <button
                            onClick={() => handleUpvote(q.id)}
                            disabled={hasUpvoted}
                            className={`flex flex-col items-center gap-0.5 pt-0.5 shrink-0 transition-colors ${
                              hasUpvoted
                                ? "text-[#FF4D00] cursor-default"
                                : "text-[#555] hover:text-white cursor-pointer"
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
                            </svg>
                            <span className="text-[11px] font-semibold">{q.upvotes}</span>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#E0E0E0] text-sm font-medium leading-snug">
                              {q.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[11px] text-[#888]">{q.authorName}</span>
                              <span className="text-[#444]">·</span>
                              <span className="text-[11px] text-[#555]">{timeAgo(q.createdAt)}</span>
                              {catInfo && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] text-[#888]">
                                  {catInfo.icon} {catInfo.label}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                              className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors"
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
                        <div className="border-t border-[#2A2A2A] bg-[#151515]">
                          {q.answers.length > 0 ? (
                            <div className="divide-y divide-[#2A2A2A]">
                              {q.answers.map((a) => (
                                <div key={a.id} className="px-4 py-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-medium text-[#E0E0E0]">{a.authorName}</span>
                                    {a.isVerifiedLocal && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-green-900/30 text-green-400 border border-green-700/40">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Local
                                      </span>
                                    )}
                                    <span className="text-[11px] text-[#555]">{timeAgo(a.createdAt)}</span>
                                  </div>
                                  <p className="text-[#C0C0C0] text-sm leading-relaxed">{a.content}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-[11px] text-[#555]">No answers yet. Be the first to help out!</p>
                            </div>
                          )}

                          {/* Inline answer form */}
                          {isJoined && (
                            <div className="px-4 py-3 border-t border-[#2A2A2A]">
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

        {/* ──── TAB 4: Reno Vision ──── */}
        {activeTab === "reno" && (
          <div className="p-4">
            {photos && photos.length > 0 && (() => {
              const typeIndex = RENO_TYPES.findIndex((t) => t.key === renoType);
              const photoIndex = typeIndex % photos.length;
              return (
                <div className="mb-4 rounded-xl overflow-hidden border border-[#2A2A2A] relative">
                  <img src={photos[photoIndex]} alt={listingAddress} className="w-full h-40 object-cover transition-all duration-500" />
                  {photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {photoIndex + 1}/{photos.length}
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="mb-3">
              <p className="text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {RENO_TYPES.map((t) => (
                  <button key={t.key} onClick={() => { setRenoType(t.key); setRenoResult(null); }} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${renoType === t.key ? "bg-[#FF4D00] text-white border-[#FF4D00]" : "bg-[#1A1A1A] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">Style</p>
              <div className="flex flex-wrap gap-1.5">
                {RENO_STYLES.map((s) => (
                  <button key={s.key} onClick={() => { setRenoStyle(s.key); setRenoResult(null); }} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${renoStyle === s.key ? "bg-[#FF4D00] text-white border-[#FF4D00]" : "bg-[#1A1A1A] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerateReno} disabled={renoLoading} className="w-full py-3 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-50 mb-4">
              {renoLoading ? "Generating..." : "Generate Vision \u2192"}
            </button>
            {renoError && <p className="text-red-400 text-sm mb-4">{renoError}</p>}
            {renoLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-48 bg-[#222] rounded-xl" />
                <div className="h-5 w-1/2 bg-[#222] rounded" />
                <div className="h-10 bg-[#222] rounded-lg" />
                <div className="h-10 bg-[#222] rounded-lg" />
              </div>
            )}
            {renoResult && !renoLoading && (
              <div className="space-y-4">
                {renoResult.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
                    <img src={renoResult.imageUrl} alt={`${renoResult.style} ${renoResult.renovationType} vision`} className="w-full object-cover" />
                  </div>
                )}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                  <p className="text-[#888] text-xs font-medium mb-1 uppercase tracking-wider">Estimated Cost Range</p>
                  <p className="text-white text-2xl font-bold">${renoResult.estimateLow.toLocaleString()} – ${renoResult.estimateHigh.toLocaleString()}</p>
                </div>
                {renoResult.materials && renoResult.materials.length > 0 && (
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <p className="text-[#888] text-xs font-medium uppercase tracking-wider">Materials & Brands</p>
                    </div>
                    {renoResult.materials.map((mat: any, i: number) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 border-b border-[#2A2A2A] last:border-0">
                        <div className="min-w-0">
                          <p className="text-[#E0E0E0] text-sm font-medium truncate">{mat.item}</p>
                          <p className="text-[#666] text-xs">{mat.brand}</p>
                        </div>
                        <span className="text-[#FF4D00] text-xs font-semibold whitespace-nowrap">{mat.priceRange}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={handlePostRenoAsTake} className="flex-1 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-sm font-medium rounded-lg hover:border-[#444] transition-all">Post as Take</button>
                  <button onClick={handleSaveRenoVision} className="flex-1 py-2.5 bg-[#1A1A1A] border border-[#FF4D00]/30 text-[#FF4D00] text-sm font-medium rounded-lg hover:bg-[#FF4D00]/10 transition-all">Save Vision</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════ ZONE 3 — Sticky bottom input bar ════════ */}
      <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A]">
        {/* ── Take input ── */}
        {activeTab === "take" && (
          <>
            {isLocked ? (
              <div className="px-4 py-3 text-center">
                <p className="text-[#555] text-sm">
                  Comments locked — this listing is no longer active.
                </p>
              </div>
            ) : !isJoined ? (
              <form onSubmit={handleJoin} className="p-4 space-y-3">
                <p className="text-white text-sm font-semibold">
                  Join the conversation
                </p>
                <p className="text-[#666] text-xs">
                  Drop your info to spill tea and react. Free, 10 seconds.
                </p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (private)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Zip code (optional — unlocks local badge)"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all"
                >
                  Join &amp; unlock →
                </button>
              </form>
            ) : (
              <form onSubmit={handlePost} className="p-4 space-y-3">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {CONTEXT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full transition-all ${
                        selectedTag === tag
                          ? "bg-[#FF4D00] text-white"
                          : "bg-[#111111] border border-[#2A2A2A] text-[#666] hover:text-[#999]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Spill the tea on this place..."
                    className="flex-1 min-w-0 rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  />
                  <button
                    type="submit"
                    disabled={posting || !content.trim()}
                    className="shrink-0 px-4 py-2.5 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {posting ? "..." : "Drop it →"}
                  </button>
                </div>
                {postError && (
                  <p className="text-red-400 text-xs">{postError}</p>
                )}
              </form>
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
                className="flex-1 min-w-0 rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() =>
                  sendAIMessage(gwakyInput, setGwakyMessages, setGwakyInput, setGwakyLoading)
                }
                disabled={gwakyLoading || !gwakyInput.trim()}
                className="shrink-0 px-4 py-2.5 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
              <p className="text-[#555] text-sm text-center py-1">
                Join the conversation on the Take tab to ask questions.
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
                      className={`whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full transition-all ${
                        newQCategory === cat.key
                          ? "bg-[#FF4D00] text-white"
                          : "bg-[#111111] border border-[#2A2A2A] text-[#666] hover:text-[#999]"
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
                    className="flex-1 min-w-0 rounded-lg bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  />
                  <button
                    type="submit"
                    disabled={postingQ || !newQuestion.trim()}
                    className="shrink-0 px-4 py-2.5 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="flex-1 min-w-0 px-3 py-2 bg-[#111111] border border-[#2A2A2A] rounded-lg text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
      />
      <button
        type="submit"
        disabled={posting || !content.trim()}
        className="shrink-0 px-3 py-2 bg-[#FF4D00] text-white text-xs font-bold rounded-lg hover:bg-[#FF4D00]/90 transition-all disabled:opacity-40"
      >
        {posting ? "..." : "Answer"}
      </button>
    </form>
  );
}
