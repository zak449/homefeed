import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-divider mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-bold text-ink tracking-tight">
              gwak<span className="text-secondary">gwak</span>
            </p>
            <p className="text-xs text-tertiary mt-2 leading-relaxed">
              The comment section of real estate. See what people actually think.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Explore</p>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-secondary hover:text-ink transition-colors">Browse</Link>
              <Link href="/?sort=comments" className="text-sm text-secondary hover:text-ink transition-colors">Trending</Link>
              <Link href="/saved" className="text-sm text-secondary hover:text-ink transition-colors">Saved</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Company</p>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-secondary hover:text-ink transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-secondary hover:text-ink transition-colors">Contact</Link>
              <Link href="/careers" className="text-sm text-secondary hover:text-ink transition-colors">Careers</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Legal</p>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-secondary hover:text-ink transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-secondary hover:text-ink transition-colors">Terms</Link>
              <Link href="/faq" className="text-sm text-secondary hover:text-ink transition-colors">FAQ</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-divider flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-tertiary">&copy; 2026 gwakgwak. All rights reserved.</p>
          <p className="text-xs text-tertiary">Real estate, real talk.</p>
        </div>
      </div>
    </footer>
  );
}
