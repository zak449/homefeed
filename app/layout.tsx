import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "gwak gwak — real neighborhoods. real opinions.",
  description: "Honest takes on every listing from real people with nothing to sell. Browse properties, join the conversation, and get the inside word on any neighborhood.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "gwak gwak",
  },
  openGraph: {
    type: "website",
    siteName: "gwak gwak",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="min-h-screen flex flex-col bg-bg pb-14 sm:pb-0">
        {/* Top nav */}
        <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-divider">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="shrink-0">
              <span className="text-xl font-bold text-ink tracking-tight">
                gwak<span className="text-secondary"> gwak</span>
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
            <span className="sm:hidden text-[11px] text-tertiary tracking-wide uppercase letter-spacing-widest">
              get inside.
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
