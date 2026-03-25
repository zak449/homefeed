"use client";

import { useState, useRef, useEffect } from "react";

type ListingContext = {
  address: string;
  city: string;
  price: number;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string;
  topTakes: string[];
};

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isMock?: boolean;
};

const SUGGESTED_PROMPTS = [
  "Is this overpriced for the area?",
  "What are red flags at this price point?",
  "Compare to similar listings nearby",
];

export default function GwakyAI({
  listingId,
  listingContext,
}: {
  listingId: string;
  listingContext: ListingContext;
}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

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
          context: listingContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg: AIMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: data.error ?? "Something went wrong. Try again!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } else {
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          isMock: data.model === "gwaky-ai-mock",
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const errMsg: AIMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Network error. Check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function handleShare(msg: AIMessage) {
    const formatted = `Gwaky AI on ${listingContext.address}:\n"${msg.content}"`;
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const hasNoMessages = messages.length === 0;

  return (
    <div className="space-y-4">
      {/* Suggested prompts — shown when no messages yet */}
      {hasNoMessages && (
        <div className="space-y-2">
          <p className="text-caption text-tertiary">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="text-caption px-3 py-2 sm:py-1.5 min-h-[36px] sm:min-h-0 rounded-full bg-bg border border-amber/25 text-secondary hover:text-ink hover:border-amber/50 hover:bg-amber/5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-ink text-bg rounded-2xl rounded-br-md px-4 py-2.5">
                  <p className="text-body">{msg.content}</p>
                  <p className="text-xs text-white/50 mt-1 text-right">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className={`border-l-[3px] rounded-xl p-4 ${
                  msg.isMock
                    ? "border-tertiary/40 bg-highlight"
                    : "border-accent bg-gradient-to-br from-[#FF4D00]/[0.04] to-surface"
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-caption font-semibold text-accent">
                    {msg.isMock ? "Gwaky AI (Preview)" : "Gwaky AI"}
                  </span>
                </div>

                {/* Response text */}
                <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-divider/50">
                  <p className="text-xs text-tertiary">
                    {formatTime(msg.timestamp)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleShare(msg)}
                    className="flex items-center gap-1.5 text-caption text-tertiary hover:text-ink transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          )}

          {/* Loading state */}
          {loading && (
            <div className="border-l-[3px] border-accent/40 rounded-xl p-4 bg-highlight">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-caption text-tertiary">
                  Gwaky is thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask Gwaky AI anything about this property..."
          disabled={loading}
          className="flex-1 min-w-0 rounded-xl border border-divider bg-bg px-4 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-amber/40 transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
