import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFeed — Browse, Comment, Connect",
  description: "A social space for home hunters. Browse listings, share your thoughts, and connect with agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">
        {/* Nav */}
        <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-display text-2xl text-ink hover:text-coral transition-colors">
              HomeFeed
            </a>
            <div className="flex items-center gap-4">
              <a href="/?type=sale" className="text-sm font-semibold text-gray-500 hover:text-ink transition-colors">
                For Sale
              </a>
              <a href="/?type=rent" className="text-sm font-semibold text-gray-500 hover:text-ink transition-colors">
                For Rent
              </a>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-24 bg-ink text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-display text-2xl">HomeFeed</p>
              <p className="text-sm text-white/40">Browse, comment, connect. Listing data from Zillow, MLS, and more.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
