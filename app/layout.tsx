import type { Metadata, Viewport } from "next";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "homefeed — real estate, real opinions",
  description: "The social layer for real estate. Browse listings, see what people are saying, and join the conversation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "homefeed",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
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
      <body className="min-h-screen flex flex-col bg-white">
        {/* Nav — clean, precise */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo — confident wordmark */}
            <a href="/" className="shrink-0">
              <span className="font-display text-[18px] font-bold text-ink tracking-display">
                homefeed
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-0.5">
              <a href="/?type=sale" className="px-3.5 py-1.5 text-[13px] font-medium text-muted hover:text-ink rounded-lg transition-colors">
                Buy
              </a>
              <a href="/?type=rent" className="px-3.5 py-1.5 text-[13px] font-medium text-muted hover:text-ink rounded-lg transition-colors">
                Rent
              </a>
              <a href="/?sort=comments" className="px-3.5 py-1.5 text-[13px] font-medium text-muted hover:text-ink rounded-lg transition-colors">
                Hot Takes
              </a>
            </nav>

            {/* Mobile menu */}
            <MobileNav />
          </div>
        </header>

        <main className="flex-1 bg-subtle">{children}</main>

        {/* Footer — barely there */}
        <footer className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-display text-sm font-semibold text-ink tracking-display">homefeed</span>
              <p className="text-xs text-muted">
                Real estate, real opinions.
              </p>
              <p className="text-xs text-muted/50">&copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
