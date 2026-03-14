import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFeed — Browse, Comment, Connect",
  description: "A social space for home hunters. Browse listings, share your thoughts, and connect with agents.",
};

const TICKER = "Browse Homes ★ Share Your Thoughts ★ Connect With Agents ★ Join The Conversation ★ Hot Takes Welcome ★ Find Your Favorite Place ★ ";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const repeated = TICKER + TICKER;
  return (
    <html lang="en">
      <body className="min-h-screen">

        {/* Rainbow top stripe */}
        <div className="h-2 flex">
          <div className="flex-1 bg-coral" />
          <div className="flex-1 bg-goldenrod" />
          <div className="flex-1 bg-sage" />
          <div className="flex-1 bg-sky" />
          <div className="flex-1 bg-lavender" />
          <div className="flex-1 bg-pink" />
        </div>

        {/* Nav */}
        <header className="sticky top-0 z-50 bg-cream border-b-3 border-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-display text-3xl text-ink leading-none hover:text-coral transition-colors tracking-tight">
              HomeFeed
            </a>
            <div className="flex items-center gap-2">
              <a href="/?type=sale" className="font-display text-xs uppercase tracking-wide border-2 border-ink px-4 py-1.5 rounded-full hover:bg-coral hover:border-coral hover:text-white transition-all shadow-brute-sm">
                For Sale
              </a>
              <a href="/?type=rent" className="font-display text-xs uppercase tracking-wide border-2 border-ink px-4 py-1.5 rounded-full hover:bg-sage hover:border-sage hover:text-white transition-all shadow-brute-sm">
                For Rent
              </a>
            </div>
          </div>
        </header>

        {/* Scrolling ticker */}
        <div className="bg-goldenrod border-b-3 border-ink overflow-hidden py-2.5">
          <div className="animate-marquee">
            <span className="font-display text-xs uppercase tracking-widest text-ink">{repeated}</span>
            <span className="font-display text-xs uppercase tracking-widest text-ink">{repeated}</span>
          </div>
        </div>

        <main>{children}</main>

        <footer className="mt-24 bg-ink text-cream border-t-3 border-ink py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="font-display text-4xl">HomeFeed</p>
              <div className="flex gap-3">
                {(["bg-coral","bg-goldenrod","bg-sage","bg-sky","bg-lavender","bg-pink"] as const).map((c) => (
                  <div key={c} className={`w-5 h-5 rounded-full border-2 border-white/30 ${c}`} />
                ))}
              </div>
              <p className="text-sm text-white/50 font-medium">Browse · Comment · Connect</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
