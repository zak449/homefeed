import type { Metadata, Viewport } from "next";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
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
        {/* Nav */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo + social tagline */}
            <a href="/" className="shrink-0 flex items-center gap-2">
              <span className="font-display text-[18px] font-bold text-ink tracking-display">
                home<span className="social-gradient">feed</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-muted bg-tag px-2 py-0.5 rounded-full">
                real talk on real estate
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
              <a href="/?sort=comments" className="px-3.5 py-1.5 text-[13px] font-medium text-social hover:text-social/80 rounded-lg transition-colors flex items-center gap-1">
                <span>🔥</span> Hot Takes
              </a>
              <a href="/saved" className="px-3.5 py-1.5 text-[13px] font-medium text-muted hover:text-ink rounded-lg transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Saved
              </a>
            </nav>

            {/* Mobile menu */}
            <MobileNav />
          </div>
        </header>

        <main className="flex-1 bg-subtle">{children}</main>

        <Footer />
        <KlaviyoScript />
      </body>
    </html>
  );
}
