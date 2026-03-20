import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Wordmark */}
        <p className="text-caption text-ink font-semibold tracking-tight mb-4">
          gwakgwak
        </p>

        {/* Links row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-tertiary">
          <Link href="/" className="hover:text-ink transition-colors">explore</Link>
          <span>&middot;</span>
          <Link href="/?sort=comments" className="hover:text-ink transition-colors">trending</Link>
          <span>&middot;</span>
          <Link href="/saved" className="hover:text-ink transition-colors">saved</Link>
          <span>&middot;</span>
          <Link href="/about" className="hover:text-ink transition-colors">about</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-ink transition-colors">privacy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-ink transition-colors">terms</Link>
        </div>

        {/* Tagline + copyright */}
        <div className="mt-6 pt-6 border-t border-divider">
          <p className="text-caption text-tertiary">
            the comment section of real estate. &copy; 2026.
          </p>
        </div>
      </div>
    </footer>
  );
}
