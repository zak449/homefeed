import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "gwakgwak — real estate, real opinions",
  description: "The social layer for real estate. Browse listings, see what people are saying, and join the conversation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "gwakgwak",
  },
  openGraph: {
    type: "website",
    siteName: "gwakgwak",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
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
      <body className="min-h-screen flex flex-col bg-white pb-14 sm:pb-0">
        {/* Top nav */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-divider">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="shrink-0">
              <span className="text-xl font-bold text-ink tracking-tight">
                gwak<span className="text-secondary">gwak</span>
              </span>
            </a>

            {/* Desktop nav — visible, not hidden */}
            <Suspense fallback={
              <nav className="hidden sm:flex items-center gap-1">
                <span className="px-4 py-1.5 rounded-full text-sm text-secondary">Explore</span>
                <span className="px-4 py-1.5 rounded-full text-sm text-secondary">Trending</span>
                <span className="px-4 py-1.5 rounded-full text-sm text-secondary">Saved</span>
              </nav>
            }>
              <NavLinks />
            </Suspense>

            {/* Mobile: show tagline instead of hamburger */}
            <span className="sm:hidden text-[11px] text-tertiary tracking-wide">
              real estate, real talk
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <Footer />

        {/* Bottom tab bar — mobile only, always visible */}
        <Suspense>
          <MobileNav />
        </Suspense>

        <KlaviyoScript />
      </body>
    </html>
  );
}
