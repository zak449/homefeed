import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "home.feed — see what your neighborhood is really worth",
  description: "Browse real estate listings. Read the comments. Call out the BS. home.feed is where neighborhoods talk about the houses on their block.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "home.feed",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Nav */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border shadow-nav">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <span className="font-display font-bold text-xl text-ink tracking-tight">home</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></span>
              <span className="font-display font-bold text-xl text-ink tracking-tight">feed</span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/?type=sale" className="px-3 py-1.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-lg transition-colors">
                For Sale
              </a>
              <a href="/?type=rent" className="px-3 py-1.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-lg transition-colors">
                For Rent
              </a>
              <a href="/?sort=comments" className="px-3 py-1.5 text-sm font-medium text-accent hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
                🔥 Hot Takes
              </a>
            </nav>

            {/* Mobile menu button */}
            <button className="sm:hidden p-2 text-muted hover:text-ink rounded-lg" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="mt-20 border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg text-ink tracking-tight">home</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1"></span>
                <span className="font-display font-bold text-lg text-ink tracking-tight">feed</span>
              </div>
              <p className="text-sm text-muted">
                where neighborhoods talk about the houses on their block
              </p>
              <p className="text-xs text-muted/60">© {new Date().getFullYear()} home.feed</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
