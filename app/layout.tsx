import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import KlaviyoScript from "@/components/KlaviyoScript";
import PostHogProvider from "@/components/PostHogProvider";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AutoSignInModal } from "@/components/auth/AutoSignInModal";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gwaky.com"),
  title: {
    default: "Gwaky — the comment section real estate never had",
    template: "%s | Gwaky",
  },
  description: "Real takes from real people. Neighbors, past renters, almost-buyers — dropping honest intel on every listing. No agents. No spin. Just the truth.",
  applicationName: "Gwaky",
  keywords: [
    "real estate",
    "real estate reviews",
    "home reviews",
    "neighborhood reviews",
    "property comments",
    "listing comments",
    "homes for sale",
    "homes for rent",
    "neighbor intel",
    "real estate community",
    "buy a home",
    "rent a home",
    "real estate transparency",
    "Gwaky",
  ],
  authors: [{ name: "Gwaky", url: "https://gwaky.com" }],
  creator: "Gwaky",
  publisher: "Gwaky",
  category: "real estate",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gwaky",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Gwaky",
    locale: "en_US",
    url: "https://gwaky.com",
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
    site: "@gwakyapp",
    creator: "@gwakyapp",
    title: "Gwaky — the comment section real estate never had",
    description: "Real takes from real people. No agents. No spin. Just the truth.",
    images: ["/og-image.png"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gwaky",
  alternateName: "Gwaky App",
  url: "https://gwaky.com",
  logo: "https://gwaky.com/icons/icon-512.png",
  description:
    "Gwaky is the comment section real estate never had — a community-powered platform where neighbors, past renters, and locals share honest intel on every listing.",
  sameAs: ["https://x.com/gwakyapp"],
  foundingDate: "2024",
  founder: {
    "@type": "Person",
    name: "Zachary Kaufman",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gwaky",
  url: "https://gwaky.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://gwaky.com/?city={search_term_string}",
    },
    "query-input": "required name=search_term_string",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg pb-0 sm:pb-0">
        <SessionProvider><PostHogProvider>
        <Suspense fallback={null}><AnalyticsProvider /></Suspense>
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

        {/* Auth modal triggered by ?signin=1 redirect from protected pages. */}
        <Suspense fallback={null}>
          <AutoSignInModal />
        </Suspense>

        {/* GDPR/CCPA cookie consent — appears on first visit only. */}
        <CookieConsentBanner />
        </PostHogProvider></SessionProvider>
      </body>
    </html>
  );
}
