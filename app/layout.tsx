import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gwaky.com"),
  title: "Gwaky — the comment section real estate never had",
  description: "Real takes from real people. Neighbors, past renters, almost-buyers — dropping honest intel on every listing. No agents. No spin. Just the truth.",
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
    title: "Gwaky — the comment section real estate never had",
    description: "Real takes from real people. Neighbors, past renters, almost-buyers — dropping honest intel on every listing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gwaky — the comment section real estate never had",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gwaky — the comment section real estate never had",
    description: "Real takes from real people. No agents. No spin. Just the truth.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="min-h-screen flex flex-col bg-bg pb-0 sm:pb-0">
        {/* Top nav — minimal, dark */}
        <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            {/* Logo — left, small */}
            <a href="/" className="shrink-0 flex items-center">
              <span className="text-[16px] font-bold text-ink tracking-tight">
                Gwak<span className="text-amber">y</span>
              </span>
            </a>

            {/* Right — desktop nav links only */}
            <Suspense fallback={
              <nav className="hidden sm:flex items-center gap-1">
                <span className="px-3 py-1.5 rounded-full text-sm text-secondary">My Block</span>
                <span className="px-3 py-1.5 rounded-full text-sm text-secondary">Hot Takes</span>
              </nav>
            }>
              <NavLinks />
            </Suspense>
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
