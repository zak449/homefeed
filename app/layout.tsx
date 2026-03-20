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
      <body className="min-h-screen flex flex-col bg-white">
        {/* Nav */}
        <header className="sticky top-0 z-50 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="shrink-0">
              <span className="text-lg font-semibold text-ink tracking-tight">
                gwakgwak
              </span>
            </a>

            {/* Desktop nav */}
            <Suspense fallback={
              <nav className="hidden sm:flex items-center gap-6">
                <span className="text-caption text-tertiary">explore</span>
                <span className="text-caption text-tertiary">trending</span>
                <span className="text-caption text-tertiary">saved</span>
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

        <main className="flex-1">{children}</main>

        <Footer />
        <KlaviyoScript />
      </body>
    </html>
  );
}
