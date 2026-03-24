import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gwaky — what your neighbors really think about the homes around you",
  description: "The community-powered real estate platform where verified neighbors share honest takes on every listing. No agents. No spin. Just the truth about your neighborhood.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gwaky",
  },
  openGraph: {
    type: "website",
    siteName: "Gwaky",
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
      <body className="min-h-screen flex flex-col bg-bg pb-0 sm:pb-0">
        {/* Top nav — premium, clean */}
        <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-divider/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo — left */}
            <a href="/" className="shrink-0 flex items-center gap-1.5">
              <span className="text-xl font-bold text-ink tracking-tight">
                Gwak<span className="text-amber">y</span>
              </span>
            </a>

            {/* Center — intentionally empty for clean feel */}
            <div className="hidden sm:block" />

            {/* Right — desktop nav links */}
            <Suspense fallback={
              <nav className="hidden sm:flex items-center gap-1">
                <span className="px-3 py-1.5 rounded-full text-sm text-secondary">Your neighborhood</span>
                <span className="px-3 py-1.5 rounded-full text-sm text-secondary">Trending</span>
              </nav>
            }>
              <NavLinks />
            </Suspense>

            {/* Mobile: show tagline */}
            <span className="sm:hidden text-[11px] text-tertiary tracking-wide uppercase">
              real takes.
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
