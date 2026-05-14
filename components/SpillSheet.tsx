"use client";

import { useState, useEffect, useRef, useMemo, useId } from "react";

// Rotating cold-open prompts. Picked once per fresh open so the user
// doesn't see the placeholder shuffle while they're thinking.
const COLD_PROMPTS = [
  "What's the truth about this place?",
  "What would you tell a buyer here?",
  "Spill what nobody's saying.",
  "What's the real story?",
];

// Compact tag set — relationship to the place. Surfaces only after the
// user has started writing.
const TAGS = [
  { key: "neighbor", label: "Neighbor" },
  { key: "past renter", label: "Past renter" },
  { key: "drove by", label: "Drove by" },
  { key: "almost bought", label: "Almost bought" },
  { key: "local", label: "Local" },
  { key: "other", label: "Other" },
];

// A tag becomes available once the body has at least this many characters.
// Keeps the picker out of the way until the user has committed to writing.
const TAG_REVEAL_THRESHOLD = 3;

const MAX_LEN = 500;

interface SpillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-filled when the sheet opens from a listing context. */
  listingAddress?: string;
  listingId?: string;
  /**
   * When true, the SpillPortal is performing its open animation. The sheet
   * defers its slide-up to ride the puddle, and its inner content fades in
   * after the pour completes. Reduced-motion users bypass this entirely.
   */
  portalRevealing?: boolean;
}

interface ListingSearchResult {
  id: string;
  address: string;
}

export default function SpillSheet({
  isOpen,
  onClose,
  listingAddress,
  listingId,
  portalRevealing,
}: SpillSheetProps) {
  // Authoring
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Optional listing pick (when no context was provided by the caller)
  const [pickedListing, setPickedListing] = useState<ListingSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ListingSearchResult[]>([]);
  const [searchingListings, setSearchingListings] = useState(false);

  // Identity (lazy — we only ask when they hit submit)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Submission lifecycle
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  // Empty-submit feedback (shake + inline hint)
  const [shaking, setShaking] = useState(false);
  const [showEmptyHint, setShowEmptyHint] = useState(false);

  // Placeholder selected once per open
  const [placeholder, setPlaceholder] = useState(COLD_PROMPTS[0]);

  // a11y ids
  const textareaId = useId();
  const tagGroupId = useId();
  const emptyHintId = useId();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reducedMotionRef = useRef(false);

  // Resolve reduced-motion once on mount.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Restore saved identity from prior sessions.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hf_commenter");
      if (saved) {
        const parsed = JSON.parse(saved) as { name?: string; email?: string };
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name && parsed.email) setIsJoined(true);
      }
    } catch {}
  }, []);

  // Pick a placeholder on each fresh open. Reduced motion users get the
  // first prompt every time — no rotation, no surprise.
  useEffect(() => {
    if (!isOpen) return;
    if (reducedMotionRef.current) {
      setPlaceholder(COLD_PROMPTS[0]);
      return;
    }
    const idx = Math.floor(Math.random() * COLD_PROMPTS.length);
    setPlaceholder(COLD_PROMPTS[idx]);
  }, [isOpen]);

  // Focus the textarea after the portal pour lands so the keyboard
  // doesn't fight the rise animation.
  useEffect(() => {
    if (!isOpen) return;
    const delay = portalRevealing ? 1150 : 280;
    const t = setTimeout(() => textareaRef.current?.focus(), delay);
    return () => clearTimeout(t);
  }, [isOpen, portalRevealing]);

  // Reset everything once the sheet has fully closed.
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setContent("");
      setSelectedTag(null);
      setPickedListing(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowAuth(false);
      setPosted(false);
      setShaking(false);
      setShowEmptyHint(false);
    }, 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Lightweight debounced listing search. Only fires when the sheet has
  // no caller-supplied listing context and the user is typing.
  useEffect(() => {
    if (listingId || pickedListing) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchingListings(true);
    const t = setTimeout(async () => {
      try {
        // Reuses the main feed endpoint with `q=` — no new route needed.
        const res = await fetch(`/api/listings?q=${encodeURIComponent(q)}&page=1`);
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as {
          listings?: Array<{ id: string; address?: string | null; city?: string | null }>;
        };
        const mapped: ListingSearchResult[] = (data.listings ?? [])
          .slice(0, 5)
          .map((l) => ({
            id: l.id,
            address: [l.address, l.city].filter(Boolean).join(", ") || l.id,
          }));
        if (!cancelled) setSearchResults(mapped);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchingListings(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery, listingId, pickedListing]);

  // Resolved listing pieces — caller context wins.
  const effectiveListingId = listingId ?? pickedListing?.id;
  const effectiveListingAddress = listingAddress ?? pickedListing?.address;
  const showListingSearch = !listingId && !listingAddress;

  // Tag picker reveals only once the user has written something.
  const showTags = content.trim().length >= TAG_REVEAL_THRESHOLD;

  const remaining = useMemo(() => MAX_LEN - content.length, [content.length]);

  function triggerEmptyFeedback() {
    setShowEmptyHint(true);
    if (!reducedMotionRef.current) {
      setShaking(true);
      window.setTimeout(() => setShaking(false), 420);
    }
  }

  async function postComment() {
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: effectiveListingId || "general",
          name,
          email,
          content: selectedTag ? `[${selectedTag}] ${content.trim()}` : content.trim(),
        }),
      });
      if (res.ok) {
        setPosted(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        window.setTimeout(() => onClose(), 1700);
      }
    } catch {}
    setPosting(false);
  }

  function handleSpill() {
    if (posting) return;
    if (!content.trim()) {
      triggerEmptyFeedback();
      return;
    }
    if (!isJoined) {
      setShowAuth(true);
      return;
    }
    void postComment();
  }

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsJoined(true);
    setShowAuth(false);
    try {
      localStorage.setItem("hf_commenter", JSON.stringify({ name, email }));
    } catch {}
    window.setTimeout(() => void postComment(), 80);
  }

  // Clear the inline empty-hint the moment the user starts typing.
  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value.slice(0, MAX_LEN);
    setContent(next);
    if (showEmptyHint && next.trim().length > 0) setShowEmptyHint(false);
  }

  return (
    <>
      {/* Backdrop — kept light during the portal reveal so the pour stays readable. */}
      <div
        className={`fixed inset-0 z-[60] backdrop-blur-sm transition-opacity duration-300 ${
          portalRevealing ? "bg-black/25" : "bg-black/55"
        } ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spill the tea"
        className={`spillsheet fixed inset-x-0 bottom-0 z-[61] rounded-t-[28px] ${
          portalRevealing
            ? "spill-sheet-rise"
            : `transition-transform duration-300 ease-out ${
                isOpen ? "translate-y-0" : "translate-y-full"
              }`
        }`}
        style={{
          maxHeight: "88vh",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
      >
        <div className={portalRevealing ? "spill-sheet-content-delayed" : undefined}>
          {/* Drag handle — single, quiet escape route alongside the swipe gesture. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="block mx-auto mt-2.5 mb-1 w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-colors"
          />

          {posted ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 animate-in fade-in zoom-in duration-300">
              <span className="text-5xl mb-3" aria-hidden="true">🫖</span>
              <p className="text-2xl font-semibold text-white mb-1">Tea spilled.</p>
              <p className="text-secondary text-sm">Your take is live.</p>
            </div>
          ) : (
            <div
              className="px-5 pt-1 pb-5 overflow-y-auto"
              style={{ maxHeight: "calc(88vh - 24px)" }}
            >
              {/* Header — single line, faint. The textarea below is the real headline. */}
              {effectiveListingAddress ? (
                <p className="text-[13px] text-secondary mb-2.5 truncate">
                  On <span className="text-white/90 font-medium">{effectiveListingAddress}</span>
                  {pickedListing && !listingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickedListing(null);
                        setSearchQuery("");
                      }}
                      className="ml-2 text-tertiary hover:text-white underline-offset-2 hover:underline"
                    >
                      change
                    </button>
                  )}
                </p>
              ) : (
                <div className="h-1.5" />
              )}

              {/* The hero — italic, parchment-ish, oversized. */}
              <label htmlFor={textareaId} className="sr-only">
                Your take
              </label>
              <textarea
                id={textareaId}
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                maxLength={MAX_LEN}
                aria-describedby={showEmptyHint ? emptyHintId : undefined}
                className="spillsheet-journal w-full min-h-[180px] bg-transparent border-0 px-1 py-2 text-white text-[22px] leading-[1.45] italic font-serif tracking-[-0.005em] placeholder:text-white/35 focus:outline-none resize-none"
              />

              {/* Counter — tiny, right-aligned, no chrome. */}
              <div className="flex justify-end -mt-1 mb-2">
                <span
                  className={`text-[11px] ${
                    remaining < 40 ? "text-amber/90" : "text-tertiary/70"
                  }`}
                  aria-live="polite"
                >
                  {remaining}
                </span>
              </div>

              {/* Inline listing search — only when no listing context. */}
              {showListingSearch && !pickedListing && (
                <div className="mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Adding to a listing? Search…"
                    className="w-full rounded-full bg-surface/60 border border-divider/70 px-4 py-2 text-sm text-white placeholder:text-tertiary/70 focus:outline-none focus:border-accent/40"
                    aria-label="Search for a listing to attach this spill to"
                  />
                  {searchQuery.trim().length >= 2 && (
                    <div className="mt-2 rounded-xl bg-surface/70 border border-divider/60 overflow-hidden">
                      {searchingListings && searchResults.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-tertiary">Looking…</p>
                      ) : searchResults.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-tertiary">
                          No matches. Skip it and spill anyway.
                        </p>
                      ) : (
                        <ul className="divide-y divide-divider/40">
                          {searchResults.map((r) => (
                            <li key={r.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPickedListing(r);
                                  setSearchResults([]);
                                  setSearchQuery("");
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-accent/10 transition-colors"
                              >
                                {r.address}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tag picker — slides in once they've started writing. */}
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                  showTags ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
                aria-hidden={!showTags}
              >
                <div
                  role="group"
                  aria-labelledby={tagGroupId}
                  className="pb-1"
                >
                  <p
                    id={tagGroupId}
                    className="text-[11px] uppercase tracking-[0.14em] text-tertiary mb-2"
                  >
                    Add a tag (optional)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS.map((t) => {
                      const checked = selectedTag === t.key;
                      return (
                        <label
                          key={t.key}
                          className={`cursor-pointer select-none px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            checked
                              ? "bg-accent text-white border-accent"
                              : "bg-transparent text-secondary border-divider hover:border-accent/50 hover:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() =>
                              setSelectedTag((cur) => (cur === t.key ? null : t.key))
                            }
                            tabIndex={showTags ? 0 : -1}
                          />
                          {t.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Auth — only when they've tried to submit without identity. */}
              {showAuth && !isJoined && (
                <form
                  onSubmit={handleAuthSubmit}
                  className="mt-3 mb-1 rounded-2xl border border-accent/30 bg-accent/5 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  <p className="text-white text-sm font-medium">Who's spilling?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg bg-bg/80 border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                      required
                      autoFocus
                      aria-label="Your name"
                    />
                    <input
                      type="email"
                      placeholder="Email (private)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg bg-bg/80 border border-divider px-3 py-2 text-sm text-white placeholder:text-tertiary focus:outline-none focus:border-accent/50"
                      required
                      aria-label="Email (kept private)"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!name.trim() || !email.trim()}
                    className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg active:scale-[0.98] transition-all disabled:opacity-40"
                  >
                    Lock in &amp; spill
                  </button>
                </form>
              )}

              {/* Empty-state inline hint — replaces the disabled-button cue. */}
              {showEmptyHint && (
                <p
                  id={emptyHintId}
                  className="mt-2 mb-1 text-[12px] text-amber/90 italic"
                  role="status"
                >
                  say something first.
                </p>
              )}

              {/* The button never goes gray. */}
              {!showAuth && (
                <button
                  type="button"
                  onClick={handleSpill}
                  aria-label="Spill the tea"
                  className={`mt-3 w-full py-3.5 bg-accent text-white text-base font-semibold rounded-2xl active:scale-[0.97] transition-transform shadow-lg shadow-accent/25 ${
                    shaking ? "spillsheet-shake" : ""
                  }`}
                >
                  {posting ? (
                    <span className="animate-pulse">Spilling…</span>
                  ) : (
                    <>
                      <span aria-hidden="true">🫖</span> Spill the tea
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scoped styles — class names are component-prefixed to avoid collisions. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.spillsheet {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(255, 209, 153, 0.07), transparent 60%),
    linear-gradient(180deg, #1a1410 0%, #120d0a 100%);
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.45);
}
.spillsheet-journal {
  font-family: ui-serif, Georgia, "Iowan Old Style", "Apple Garamond", "Times New Roman", serif;
  caret-color: #ffb277;
}
@keyframes spillsheet-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
.spillsheet-shake {
  animation: spillsheet-shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@media (prefers-reduced-motion: reduce) {
  .spillsheet-shake { animation: none; }
}
`,
        }}
      />
    </>
  );
}
