"use client";

import { useState, useEffect, useRef } from "react";

// Role-specific prompts — the key to unlocking specific receipts
const ROLE_PROMPTS: Record<string, string[]> = {
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
    "Does the listing photos match reality?",
    "What did you notice that the photos don't show?",
  ],
  "almost bought": [
    "What made you walk?",
    "What did the inspection reveal?",
    "What did your agent say off the record?",
  ],
  local: [
    "What's the one thing Zillow can't tell you about this area?",
    "Is this block trending up or down?",
    "What do the neighbors actually think about this place?",
  ],
  other: [
    "What's something nobody's saying about this place?",
    "Drop your unfiltered take...",
    "What would you want to know before signing?",
  ],
};

interface SpillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listingAddress?: string; // Pre-filled if on listing page
  listingId?: string;
}

export default function SpillSheet({ isOpen, onClose, listingAddress, listingId }: SpillSheetProps) {
  // States
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Restore saved identity
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const { name: n, email: e } = JSON.parse(saved);
        if (n) setName(n);
        if (e) setEmail(e);
        if (n && e) setIsJoined(true);
      }
    } catch {}
  }, []);

  // Focus textarea when sheet opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedRole(null);
        setContent("");
        setPosted(false);
        setShowAuth(false);
      }, 300);
    }
  }, [isOpen]);

  // Get current prompt based on role
  const currentPrompt = selectedRole
    ? ROLE_PROMPTS[selectedRole]?.[Math.floor(Math.random() * (ROLE_PROMPTS[selectedRole]?.length ?? 1))] ?? "Spill the tea..."
    : "";

  // Use a ref to store the prompt so it doesn't change on re-render
  const promptRef = useRef("");
  useEffect(() => {
    if (selectedRole && !promptRef.current) {
      const prompts = ROLE_PROMPTS[selectedRole];
      if (prompts) {
        promptRef.current = prompts[Math.floor(Math.random() * prompts.length)];
      }
    }
    if (!selectedRole) promptRef.current = "";
  }, [selectedRole]);

  const displayPrompt = promptRef.current || currentPrompt;

  // Handle post
  async function handleSpill() {
    if (!content.trim() || posting) return;

    if (!isJoined) {
      setShowAuth(true);
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listingId || "general",
          name,
          email,
          content: selectedRole ? `[${selectedRole}] ${content}` : content,
        }),
      });
      if (res.ok) {
        setPosted(true);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => onClose(), 1800);
      }
    } catch {}
    setPosting(false);
  }

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsJoined(true);
    setShowAuth(false);
    try {
      localStorage.setItem("hf_commenter", JSON.stringify({ name, email }));
    } catch {}
    // Auto-post after auth
    setTimeout(() => handleSpill(), 100);
  }

  const roles = [
    { key: "neighbor", emoji: "🏠", label: "Neighbor" },
    { key: "past renter", emoji: "🔑", label: "Past Renter" },
    { key: "drove by", emoji: "🚗", label: "Drove By" },
    { key: "almost bought", emoji: "💔", label: "Almost Bought" },
    { key: "local", emoji: "📍", label: "Local" },
    { key: "other", emoji: "💬", label: "Other" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-[61] bg-bg rounded-t-3xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "92vh", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Success state */}
        {posted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 animate-in fade-in zoom-in duration-300">
            <span className="text-6xl mb-4">🫖</span>
            <p className="text-2xl font-bold text-white mb-2">Tea spilled.</p>
            <p className="text-secondary text-sm">Your take is live. The block will never be the same.</p>
          </div>
        ) : (
          <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "calc(92vh - 40px)" }}>
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">
                {listingAddress ? `Spilling on ${listingAddress}` : "Spill the tea"}
              </h2>
              {!listingAddress && (
                <p className="text-sm text-secondary mt-1">Pick a listing from the feed first, or drop a general take.</p>
              )}
            </div>

            {/* Textarea — always enabled, the CTA */}
            <div className="mb-4">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={selectedRole ? displayPrompt : "What do you know about this place?"}
                className="w-full h-32 rounded-xl bg-surface border border-divider px-4 py-3 text-white text-base placeholder:text-tertiary/60 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-tertiary">{content.length}/500</span>
                {content.length > 0 && (
                  <span className="text-xs text-accent">Ready to spill</span>
                )}
              </div>
            </div>

            {/* Role-specific prompt hint — subtle, between textarea and role selector */}
            {selectedRole && displayPrompt && (
              <p className="text-accent/70 text-sm italic mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {displayPrompt}
              </p>
            )}

            {/* Role selector */}
            <div className="mb-5">
              <p className="text-xs text-secondary uppercase tracking-wider font-semibold mb-3">Your relationship to this place</p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => {
                      setSelectedRole(selectedRole === role.key ? null : role.key);
                      promptRef.current = "";
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedRole === role.key
                        ? "bg-accent text-white shadow-lg shadow-accent/30 scale-[1.02]"
                        : "bg-surface border border-divider text-secondary hover:border-accent/40"
                    }`}
                  >
                    <span className="text-base">{role.emoji}</span>
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth form — slides in when needed */}
            {showAuth && !isJoined && (
              <form onSubmit={handleAuthSubmit} className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-white text-sm font-semibold">One more thing — who's spilling?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2.5 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                    required
                    autoFocus
                  />
                  <input
                    type="email"
                    placeholder="Email (private)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 rounded-lg bg-bg border border-divider px-3 py-2.5 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim()}
                  className="w-full py-2.5 bg-accent text-white font-bold rounded-lg active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Lock in &amp; spill →
                </button>
              </form>
            )}

            {/* Spill button — the mic drop */}
            {!showAuth && (
              <button
                type="button"
                onClick={handleSpill}
                disabled={!content.trim() || posting}
                className="w-full py-4 bg-accent text-white text-lg font-extrabold rounded-2xl active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:shadow-accent/40"
              >
                {posting ? (
                  <span className="animate-pulse">Spilling...</span>
                ) : (
                  <>🫖 Spill it</>
                )}
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-2.5 text-secondary text-sm font-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
