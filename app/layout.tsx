import type { Metadata, Viewport } from "next";
import MobileNav from "@/components/MobileNav";
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
  themeColor: "#FAF9F6",
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
        <header className="sticky top-0 z-50 glass border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Logo — editorial serif for personality */}
            <a href="/" className="flex items-center gap-0.5 shrink-0 group">
              <span className="font-editorial text-2xl text-ink tracking-tight">home</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 group-hover:scale-125 transition-transform"></span>
              <span className="font-editorial text-2xl text-ink tracking-tight">feed</span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/?type=sale" className="px-3.5 py-1.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-full transition-all">
                Buy
              </a>
              <a href="/?type=rent" className="px-3.5 py-1.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-full transition-all">
                Rent
              </a>
              <a href="/?sort=comments" className="px-3.5 py-1.5 text-sm font-medium text-accent hover:bg-warm rounded-full transition-all flex items-center gap-1">
                Hot Takes
              </a>
            </nav>

            {/* Mobile menu */}
            <MobileNav />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Footer — minimal, warm */}
        <footer className="mt-20 border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-0.5">
                <span className="font-editorial text-xl text-ink">home</span>
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5"></span>
                <span className="font-editorial text-xl text-ink">feed</span>
              </a>
              <p className="text-sm text-muted italic font-editorial text-lg">
                where neighborhoods talk
              </p>
              <p className="text-xs text-muted/50">&copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
