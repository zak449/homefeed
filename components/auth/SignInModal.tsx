"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  returnTo?: string;
}

interface ProvidersResponse {
  providers: string[];
}

export function SignInModal({ open, onClose, returnTo }: SignInModalProps) {
  const [providers, setProviders] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/providers-list")
      .then((r) => (r.ok ? (r.json() as Promise<ProvidersResponse>) : { providers: [] }))
      .then((d) => setProviders(d.providers ?? []))
      .catch(() => setProviders([]));
  }, [open]);

  if (!open) return null;

  const callbackUrl = returnTo ?? "/";

  const onOAuth = async (id: string) => {
    setSubmitting(id);
    await signIn(id, { callbackUrl });
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting("resend");
    await signIn("resend", { email, callbackUrl });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-bg border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-bold text-ink">Welcome to Gwaky</h2>
        <p className="text-sm text-secondary mt-1">Sign in to comment, save listings, and follow neighborhoods.</p>

        <div className="mt-5 space-y-2">
          {providers.includes("google") && (
            <button
              onClick={() => onOAuth("google")}
              disabled={submitting !== null}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white/10 disabled:opacity-60"
            >
              {submitting === "google" ? "Connecting…" : "Continue with Google"}
            </button>
          )}
          {providers.includes("apple") && (
            <button
              onClick={() => onOAuth("apple")}
              disabled={submitting !== null}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white/10 disabled:opacity-60"
            >
              {submitting === "apple" ? "Connecting…" : "Continue with Apple"}
            </button>
          )}
          {providers.includes("github") && (
            <button
              onClick={() => onOAuth("github")}
              disabled={submitting !== null}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white/10 disabled:opacity-60"
            >
              {submitting === "github" ? "Connecting…" : "Continue with GitHub"}
            </button>
          )}
        </div>

        {providers.includes("resend") && (
          <form onSubmit={onEmail} className="mt-4 space-y-2">
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide">
              Or sign in with email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm text-ink placeholder:text-secondary focus:border-amber focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting !== null}
              className="w-full rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-bg hover:bg-amber/90 disabled:opacity-60"
            >
              {submitting === "resend" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        {providers.length === 0 && (
          <div className="mt-5 rounded-xl border border-amber/20 bg-amber/5 p-4 text-sm text-amber">
            Sign-in providers haven&rsquo;t been configured yet. See AUTH_SETUP.md.
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full text-xs text-secondary hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
