"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntelBoxProps {
  listingId: string;
  isLocked?: boolean;
  listingAddress: string;
  listingPrice: string;
  photos?: string[];
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

type Tab = "intel" | "gwaky" | "renovation";

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

const RENOVATION_CATEGORIES = [
  { label: "Curb Appeal", emoji: "🏡" },
  { label: "Backyard Dreams", emoji: "🏖️" },
  { label: "Interior Refresh", emoji: "✨" },
  { label: "Smart Upgrades", emoji: "💰" },
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntelBox({
  listingId,
  isLocked = false,
  listingAddress,
  listingPrice,
  photos,
  listingContext,
}: IntelBoxProps) {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>("intel");

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

  // ── AI chat state (shared structure for gwaky + renovation) ──
  const [gwakyMessages, setGwakyMessages] = useState<AIMessage[]>([]);
  const [gwakyInput, setGwakyInput] = useState("");
  const [gwakyLoading, setGwakyLoading] = useState(false);

  const [renovationMessages, setRenovationMessages] = useState<AIMessage[]>([]);
  const [renovationInput, setRenovationInput] = useState("");
  const [renovationLoading, setRenovationLoading] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Refs ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const gwakyEndRef = useRef<HTMLDivElement>(null);
  const renovationEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // ── Sorted comments (newest first) ──
  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  // ── Auto-scroll AI messages ──
  useEffect(() => {
    gwakyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gwakyMessages]);

  useEffect(() => {
    renovationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [renovationMessages]);

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

  // ── Send AI message (shared for gwaky + renovation) ──
  async function sendAIMessage(
    text: string,
    mode: "default" | "renovation",
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
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          listingId,
          context: listingContext
            ? { ...listingContext, topTakes: comments.slice(0, 5).map((c) => c.content) }
            : undefined,
          mode,
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
    { key: "intel", label: "🫖 Intel Feed" },
    { key: "gwaky", label: "✨ Ask Gwaky AI" },
    { key: "renovation", label: "💡 Renovation AI" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex flex-col border border-[#2A2A2A] rounded-2xl overflow-hidden"
      style={{
        background: "#111111",
        minHeight: "600px",
        maxHeight: "80vh",
      }}
    >
      {/* ════════ ZONE 1 — Sticky tab header ════════ */}
      <div className="sticky top-0 z-10 bg-[#111111] border-b border-[#2A2A2A] px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
        {/* ──── TAB 1: Intel Feed ──── */}
        {activeTab === "intel" && (
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
                  The block is watching. Be first to spill.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedComments.map((comment) => {
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
                        </div>
                        <span className="ml-auto text-[11px] text-[#555] shrink-0">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {/* Take */}
                      <p className="text-[#E0E0E0] text-sm font-semibold leading-relaxed mb-3">
                        {comment.content}
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

        {/* ──── TAB 2: Ask Gwaky AI ──── */}
        {activeTab === "gwaky" && (
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
                        sendAIMessage(prompt, "default", setGwakyMessages, setGwakyInput, setGwakyLoading)
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

        {/* ──── TAB 3: Renovation AI ──── */}
        {activeTab === "renovation" && (
          <div className="p-4">
            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {RENOVATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() =>
                    sendAIMessage(
                      `Give me specific renovation ideas for "${cat.label}" for this property with cost ranges and estimated value added.`,
                      "renovation",
                      setRenovationMessages,
                      setRenovationInput,
                      setRenovationLoading
                    )
                  }
                  className="text-xs px-3 py-2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#999] hover:text-white hover:border-[#FF4D00]/40 transition-all"
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {renovationMessages.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-3">💡</p>
                <p className="text-white font-semibold text-lg mb-1">Renovation AI</p>
                <p className="text-[#666] text-sm">
                  Tap a category or ask about specific upgrades for this property
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {renovationMessages.map((msg) =>
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
                          💡 Renovation AI
                        </span>
                      </div>
                      <p className="text-[#E0E0E0] text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2A2A2A]">
                        <p className="text-[10px] text-[#555]">{formatTime(msg.timestamp)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg, "Renovation AI")}
                            className="flex items-center gap-1 text-[11px] text-[#555] hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={() => handleCopy(msg, "Renovation AI")}
                            className="flex items-center gap-1 text-[11px] text-[#555] hover:text-white transition-colors"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
                {renovationLoading && (
                  <div className="border-l-[3px] border-[#FF4D00]/40 rounded-xl p-4 bg-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00]/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-[#555]">Thinking about renovations...</span>
                    </div>
                  </div>
                )}
                <div ref={renovationEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════ ZONE 3 — Sticky bottom input bar ════════ */}
      <div className="sticky bottom-0 bg-[#0E0E0E] border-t border-[#2A2A2A]">
        {/* ── Intel Feed input ── */}
        {activeTab === "intel" && (
          <>
            {isLocked ? (
              <div className="px-4 py-3 text-center">
                <p className="text-[#555] text-sm">
                  Comments locked — this listing is no longer active.
                </p>
              </div>
            ) : !isJoined ? (
              /* Join gate */
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
                  className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (private)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Zip code (optional — unlocks local badge)"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all"
                >
                  Join &amp; unlock →
                </button>
              </form>
            ) : (
              /* Compose input */
              <form onSubmit={handlePost} className="p-4 space-y-3">
                {/* Context tags */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {CONTEXT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full transition-all ${
                        selectedTag === tag
                          ? "bg-[#FF4D00] text-white"
                          : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#666] hover:text-[#999]"
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
                    className="flex-1 min-w-0 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50"
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

        {/* ── Gwaky AI input ── */}
        {activeTab === "gwaky" && (
          <div className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={gwakyInput}
                onChange={(e) => setGwakyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage(gwakyInput, "default", setGwakyMessages, setGwakyInput, setGwakyLoading);
                  }
                }}
                placeholder="Ask Gwaky AI anything about this property..."
                disabled={gwakyLoading}
                className="flex-1 min-w-0 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() =>
                  sendAIMessage(gwakyInput, "default", setGwakyMessages, setGwakyInput, setGwakyLoading)
                }
                disabled={gwakyLoading || !gwakyInput.trim()}
                className="shrink-0 px-4 py-2.5 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨
              </button>
            </div>
          </div>
        )}

        {/* ── Renovation AI input ── */}
        {activeTab === "renovation" && (
          <div className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={renovationInput}
                onChange={(e) => setRenovationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage(
                      renovationInput,
                      "renovation",
                      setRenovationMessages,
                      setRenovationInput,
                      setRenovationLoading
                    );
                  }
                }}
                placeholder="Ask about renovations, costs, ROI..."
                disabled={renovationLoading}
                className="flex-1 min-w-0 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4D00]/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() =>
                  sendAIMessage(
                    renovationInput,
                    "renovation",
                    setRenovationMessages,
                    setRenovationInput,
                    setRenovationLoading
                  )
                }
                disabled={renovationLoading || !renovationInput.trim()}
                className="shrink-0 px-4 py-2.5 bg-[#FF4D00] text-white text-sm font-bold rounded-lg hover:bg-[#FF4D00]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
