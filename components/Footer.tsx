import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-divider mt-16 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          {/* Left: Brand + tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-sm font-bold text-ink tracking-tight">
              gwak <span className="text-secondary">gwak</span>
            </p>
            <span className="hidden sm:block text-divider">·</span>
            <p className="hidden sm:block text-xs text-tertiary">
              Honest opinions on every listing.
            </p>
          </div>

          {/* Center: Nav links inline */}
          <nav className="flex items-center gap-5 sm:gap-6">
            <Link href="/" className="text-xs text-tertiary hover:text-ink transition-colors">Browse</Link>
            <Link href="/?sort=comments" className="text-xs text-tertiary hover:text-ink transition-colors">Trending</Link>
            <Link href="/saved" className="text-xs text-tertiary hover:text-ink transition-colors">Saved</Link>
            <Link href="/about" className="text-xs text-tertiary hover:text-ink transition-colors">About</Link>
            <Link href="/privacy" className="text-xs text-tertiary hover:text-ink transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-tertiary hover:text-ink transition-colors">Terms</Link>
          </nav>

          {/* Right: Copyright */}
          <p className="text-xs text-tertiary shrink-0">
            &copy; 2026 gwak gwak
          </p>
        </div>
      </div>
    </footer>
  );
}
