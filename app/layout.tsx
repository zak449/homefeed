import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
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
  openGraph: {
    type: "website",
    siteName: "homefeed",
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

            {/* Desktop nav — context-aware active states */}
            <Suspense fallback={
              <nav className="hidden sm:flex items-center gap-0.5">
                <a href="/?type=sale" className="px-3.5 py-1.5 text-[13px] font-semibold text-muted hover:text-ink rounded-lg transition-colors flex items-center gap-1.5"><span className="text-sm">🏡</span> Buy</a>
                <a href="/?type=rent" className="px-3.5 py-1.5 text-[13px] font-semibold text-muted hover:text-ink rounded-lg transition-colors flex items-center gap-1.5"><span className="text-sm">🔑</span> Rent</a>
                <a href="/?sort=comments" className="px-3.5 py-1.5 text-[13px] font-semibold text-social rounded-lg transition-colors flex items-center gap-1">🔥 Hot Takes</a>
                <a href="/saved" className="px-3.5 py-1.5 text-[13px] font-semibold text-muted rounded-lg transition-colors">Saved</a>
              </nav>
            }>
              <NavLinks />
            </Suspense>

            {/* Mobile menu */}
            <Suspense>
              <MobileNav />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 bg-subtle">{children}</main>

        <Footer />
        <KlaviyoScript />
      </body>
    </html>
  );
}
