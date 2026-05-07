"use client";

/**
 * SpillSheet — bottom sheet for posting a take.
 *
 * viral-design overhaul: the previous version had a critical dead-end where
 * tapping Spill from the home / profile / saved tabs (anywhere without a
 * listing context) opened a textarea floating in space — no listing target,
 * no picker, no path. The fix: when no listing is passed, the sheet opens
 * in `picker` mode showing recent listings + a search box + a "Spill on the
 * neighborhood" general option. Once the user picks a target, the sheet
 * pivots to the composer. No unhomed posts.
 *
 * Other changes:
 *   - Brand chrome (tea-button, tea-pill) instead of raw amber utilities.
 *   - All role prompts visible at once after selection (was rotating-and-hiding).
 *   - Microcopy pass — every line has a destination.
 *   - aria-label on textarea, role buttons, and the picker.
 */

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Role prompts (kept) ───────────────────────────────────

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
    "Do the listing photos match reality?",
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

const ROLES = [
  { key: "neighbor",      emoji: "🏠", label: "Neighbor" },
  { key: "past renter",   emoji: "🔑", label: "Past Renter" },
  { key: "drove by",      emoji: "🚗", label: "Drove By" },
  { key: "almost bought", emoji: "💔", label: "Almost Bought" },
  { key: "local",         emoji: "📍", label: "Local" },
  { key: "other",         emoji: "💬", label: "Other" },
] as const;

// ─── Types ─────────────────────────────────────────────────

interface RecentTarget {
  id: string;
  address: string;
  city?: string;
}

interface SpillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional preselected target. When omitted, the sheet opens in picker mode. */
  listingAddress?: string;
  listingId?: string;
}

// ─── Component ─────────────────────────────────────────────

export default function SpillSheet({ isOpen, onClose, listingAddress, listingId }: SpillSheetProps) {
  // Internal target — initialized from props, settable by picker
  const [target, setTarget] = useState<{ id?: string; address?: string } | null>(
    listingId ? { id: listingId, address: listingAddress } : null
  );

  // Composer state
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Picker state
  const [recents, setRecents] = useState<RecentTarget[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<RecentTarget[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Reset target when props change (e.g., user opens from a different page)
  useEffect(() => {
    if (listingId) setTarget({ id: listingId, address: listingAddress });
  }, [listingId, listingAddress]);

  // ── Restore saved identity
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

  // ── Load recent listings the user has touched (from localStorage)
  useEffect(() => {
    if (!isOpen || target) return;
    try {
      // Two possible sources — recently_viewed (existing convention) and saved.
      const rv = JSON.parse(localStorage.getItem("hf_recently_viewed") ?? "[]");
      const saved = JSON.parse(localStorage.getItem("hf_saved_listings") ?? "[]");
      const all: RecentTarget[] = [];
      const seen = new Set<string>();
      for (const item of [...rv, ...saved]) {
        if (!item) continue;
        const id = typeof item === "string" ? item : item?.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        all.push({
          id,
          address: typeof item === "string"
            ? "Recently viewed listing"
            : (item.address ?? item.title ?? "Recently viewed listing"),
          city: typeof item === "string" ? undefined : item.city,
        });
        if (all.length >= 5) break;
      }
      setRecents(all);
    } catch {}
  }, [isOpen, target]);

  // ── Focus textarea when composer is mounted
  useEffect(() => {
    if (isOpen && target && textareaRef.current) {
      const t = setTimeout(() => textareaRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen, target]);

  // ── Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setSelectedRole(null);
        setContent("");
        setPosted(false);
        setShowAuth(false);
        setSearch("");
        setSearchResults([]);
        // Reset target only if no parent context was provided
        if (!listingId) setTarget(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, listingId]);

  // ── Search listings as user types in the picker
  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        // Reuses the main listings endpoint — `q` already does address/city/zip search.
        const res = await fetch(`/api/listings?q=${encodeURIComponent(search)}&page=1`);
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        if (cancelled) return;
        const items: RecentTarget[] = (data?.listings ?? []).slice(0, 8).map(
          (l: { id: string; address?: string; title?: string; city?: string }) => ({
            id: l.id,
            address: l.address ?? l.title ?? "Listing",
            city: l.city,
          }),
        );
        setSearchResults(items);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 240);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search]);

  // ── Pick role prompt deterministically per session/role
  const promptRef = useRef("");
  useEffect(() => {
    if (selectedRole) {
      const prompts = ROLE_PROMPTS[selectedRole];
      if (prompts) promptRef.current = prompts[Math.floor(Math.random() * prompts.length)];
    } else {
      promptRef.current = "";
    }
  }, [selectedRole]);

  const allRolePrompts = useMemo(
    () => (selectedRole ? ROLE_PROMPTS[selectedRole] ?? [] : []),
    [selectedRole]
  );

  // ─── Handlers ──────────────────────────────────────────

  async function handleSpill() {
    if (!content.trim() || posting) return;
    if (!isJoined) { setShowAuth(true); return; }

    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: target?.id || "general",
          name, email,
          content: selectedRole ? `[${selectedRole}] ${content}` : content,
        }),
      });
      if (res.ok) {
        setPosted(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
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
    try { localStorage.setItem("hf_commenter", JSON.stringify({ name, email })); } catch {}
    setTimeout(() => handleSpill(), 100);
  }

  function pickTarget(t: RecentTarget) {
    setTarget({ id: t.id, address: t.address });
  }

  function pickGeneral() {
    setTarget({ id: undefined, address: undefined });
    // We mark target as a non-null sentinel object (with no id) — composer
    // will post against listingId="general".
  }

  // ─── Render ────────────────────────────────────────────

  const sheetIsInteractive = isOpen;
  const showPicker = sheetIsInteractive && !target && !posted;
  const showComposer = sheetIsInteractive && target !== null && !posted;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-scrim backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={target ? "Post a take" : "Pick a listing to spill on"}
        className={`fixed inset-x-0 bottom-0 z-[61] bg-bg rounded-t-sheet border-t border-divider transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: "92vh",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          background:
            "radial-gradient(140% 90% at 50% 0%, rgba(255,46,147,0.10) 0%, transparent 50%), #0F0A14",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden />
        </div>

        {/* ─── Success state ─── */}
        {posted && (
          <div className="flex flex-col items-center justify-center py-16 px-6 animate-in fade-in zoom-in duration-300">
            <span className="text-6xl mb-4 badge-pop inline-block">🫖</span>
            <p className="font-display text-display text-ink mb-2">Tea spilled.</p>
            <p className="text-secondary text-body">Your take is live. The block will never be the same.</p>
          </div>
        )}

        {/* ─── Picker mode ─── */}
        {showPicker && (
          <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "calc(92vh - 40px)" }}>
            <div className="mb-4">
              <h2 className="font-display text-headline text-ink">Pick what to spill on</h2>
              <p className="text-secondary text-body mt-1">
                Tap a listing you've seen, search for one, or drop a take on the neighborhood.
              </p>
            </div>

            {/* Search */}
            <label className="block mb-4">
              <span className="sr-only">Search listings by address or city</span>
              <div className="search-input-wrapper relative">
                <svg
                  className="search-icon absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
                >
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search address or city…"
                  className="w-full rounded-button bg-surface border border-divider pl-9 pr-3 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none focus:border-tea-500/50"
                  autoFocus
                />
              </div>
            </label>

            {/* Search results */}
            {search.length >= 2 && (
              <div className="mb-4">
                <p className="text-tag uppercase tracking-wider text-tertiary mb-2">
                  {searchLoading ? "Searching…" : searchResults.length === 0 ? "No matches" : "Matches"}
                </p>
                <ul className="space-y-1.5">
                  {searchResults.map(r => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => pickTarget(r)}
                        className="w-full text-left px-3 py-2.5 rounded-button bg-surface border border-divider hover:border-tea-500/40 transition-colors flex items-center gap-3"
                      >
                        <span className="text-base" aria-hidden>📍</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-body text-ink truncate">{r.address}</span>
                          {r.city && <span className="block text-caption text-secondary truncate">{r.city}</span>}
                        </span>
                        <span className="text-tertiary text-tag">PICK →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recents */}
            {search.length < 2 && recents.length > 0 && (
              <div className="mb-4">
                <p className="text-tag uppercase tracking-wider text-tertiary mb-2">You were just looking at</p>
                <ul className="space-y-1.5">
                  {recents.map(r => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => pickTarget(r)}
                        className="w-full text-left px-3 py-2.5 rounded-button bg-surface border border-divider hover:border-tea-500/40 transition-colors flex items-center gap-3"
                      >
                        <span className="text-base" aria-hidden>🏠</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-body text-ink truncate">{r.address}</span>
                          {r.city && <span className="block text-caption text-secondary truncate">{r.city}</span>}
                        </span>
                        <span className="text-tertiary text-tag">SPILL →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* General — always available */}
            <button
              type="button"
              onClick={pickGeneral}
              className="next-up-cta w-full"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>🌍</span>
                <span>Spill on the neighborhood in general</span>
              </span>
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-2.5 text-secondary text-caption font-medium hover:text-ink transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {/* ─── Composer mode ─── */}
        {showComposer && (
          <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "calc(92vh - 40px)" }}>
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-headline text-ink truncate">
                  {target?.address ? `Spilling on ${target.address}` : "Spilling on the neighborhood"}
                </h2>
                <p className="text-secondary text-caption mt-1">
                  {target?.id
                    ? "Your take will land on this listing's thread."
                    : "Your take will surface in the city feed."}
                </p>
              </div>
              {!listingId && (
                <button
                  type="button"
                  onClick={() => { setTarget(null); }}
                  className="tea-pill shrink-0"
                  aria-label="Pick a different listing"
                >
                  Change
                </button>
              )}
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <label htmlFor="spill-textarea" className="sr-only">Your take</label>
              <textarea
                id="spill-textarea"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                placeholder={
                  selectedRole
                    ? promptRef.current || "Spill the tea…"
                    : "What do you know that the listing photos don't show?"
                }
                className="comment-textarea w-full h-32 rounded-button bg-surface border border-divider px-4 py-3 text-ink text-body placeholder:text-tertiary focus:outline-none focus:border-tea-500/50 resize-none"
              />
              <div className="flex justify-between items-center mt-1.5 text-tag uppercase tracking-wider">
                <span className="text-tertiary tabular-nums">{content.length} / 500</span>
                {content.length > 0 && (
                  <span className="text-tea-300">Ready to spill</span>
                )}
              </div>
            </div>

            {/* Role-specific prompts — full list, not rotating-and-hiding */}
            {selectedRole && allRolePrompts.length > 0 && (
              <div className="mb-4 rounded-button border border-tea-500/30 bg-tea-500/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-tag uppercase tracking-wider text-tea-300 mb-1.5">Try one of these</p>
                <ul className="space-y-1">
                  {allRolePrompts.map((p, i) => (
                    <li key={i} className="text-secondary text-caption italic">— {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Role selector */}
            <div className="mb-5">
              <p className="text-tag uppercase tracking-wider text-secondary mb-3">Your relationship to this place</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedRole(isSelected ? null : role.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-button text-body font-medium transition-all ${
                        isSelected
                          ? "bg-tea-500 text-steam shadow-glow-tea scale-[1.02]"
                          : "bg-surface border border-divider text-secondary hover:border-tea-500/40"
                      }`}
                    >
                      <span className="text-base" aria-hidden>{role.emoji}</span>
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth form */}
            {showAuth && !isJoined && (
              <form
                onSubmit={handleAuthSubmit}
                className="mb-4 rounded-button border border-tea-500/30 bg-tea-500/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <p className="text-ink text-body font-semibold">One more thing — who's spilling?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 min-w-0 rounded-button bg-bg border border-divider px-3 py-2.5 text-caption text-ink placeholder:text-tertiary focus:outline-none focus:border-tea-500/50"
                    required
                    autoFocus
                    aria-label="Your name"
                  />
                  <input
                    type="email"
                    placeholder="Email (private)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 rounded-button bg-bg border border-divider px-3 py-2.5 text-caption text-ink placeholder:text-tertiary focus:outline-none focus:border-tea-500/50"
                    required
                    aria-label="Your email — kept private"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim()}
                  className="tea-button w-full py-2.5"
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
                className="tea-button w-full py-4 text-lg"
                aria-label={posting ? "Posting your take" : "Post your take"}
              >
                {posting ? <span className="animate-pulse">Spilling…</span> : <>🫖 Spill it</>}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-2.5 text-secondary text-caption font-medium hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
