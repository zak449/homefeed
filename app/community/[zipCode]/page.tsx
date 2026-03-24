import Link from "next/link";
import { Suspense } from "react";
import ZipVerification from "@/components/ZipVerification";
import NeighborQA from "@/components/NeighborQA";

type CommunityStats = {
  memberCount: number;
  totalTakes: number;
  activeDiscussions: number;
  recentAlerts: { id: string; text: string; type: string; createdAt: string }[];
  trendingListings: {
    id: string;
    address: string;
    price: number;
    listingType: string;
    photo: string | null;
    commentCount: number;
  }[];
};

export async function generateMetadata({ params }: { params: Promise<{ zipCode: string }> }) {
  const { zipCode } = await params;
  return {
    title: `${zipCode} Community — gwak gwak`,
    description: `Join the ${zipCode} community. Ask questions, get answers from verified locals, and stay up-to-date with your neighborhood.`,
  };
}

async function getCommunityStats(zipCode: string): Promise<CommunityStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/community/${zipCode}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function alertIcon(type: string) {
  switch (type) {
    case "safety":
      return "🚨";
    case "event":
      return "📅";
    case "construction":
      return "🚧";
    case "info":
      return "💡";
    default:
      return "📢";
  }
}

export default async function CommunityPage({ params }: { params: Promise<{ zipCode: string }> }) {
  const { zipCode } = await params;
  const stats = await getCommunityStats(zipCode);

  const memberCount = stats?.memberCount ?? 0;
  const totalTakes = stats?.totalTakes ?? 0;
  const activeDiscussions = stats?.activeDiscussions ?? 0;
  const alerts = stats?.recentAlerts ?? [];
  const trending = stats?.trendingListings ?? [];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-caption text-secondary mb-6">
          <Link href="/" className="hover:text-ink transition-colors">
            gwak gwak
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{zipCode} Community</span>
        </nav>

        {/* Hero section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-card bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">🏘️</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight leading-tight">
                {zipCode}{" "}
                <span className="text-secondary font-normal text-xl sm:text-2xl">
                  Community
                </span>
              </h1>
              <p className="text-body text-secondary mt-1">
                Your neighborhood, your voice. Ask anything, answer everything.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-caption font-semibold text-ink">
                {memberCount.toLocaleString()} member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            {totalTakes > 0 && (
              <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-full">
                <span className="text-caption font-semibold text-ink">
                  {totalTakes.toLocaleString()} take{totalTakes !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {activeDiscussions > 0 && (
              <div className="flex items-center gap-2 bg-amber/10 border border-amber/20 px-4 py-2 rounded-full">
                <span className="text-caption font-semibold text-amber">
                  {activeDiscussions} active discussion{activeDiscussions !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Q&A Section */}
            <section>
              <Suspense
                fallback={
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-surface border border-divider rounded-card p-5"
                      >
                        <div className="h-4 w-3/4 skeleton rounded mb-3" />
                        <div className="h-3 w-1/3 skeleton rounded" />
                      </div>
                    ))}
                  </div>
                }
              >
                <NeighborQA zipCode={zipCode} />
              </Suspense>
            </section>

            {/* Community Alerts */}
            {alerts.length > 0 && (
              <section>
                <h2 className="text-title text-ink mb-4">Community Alerts</h2>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 bg-surface border border-divider rounded-card px-4 py-3"
                    >
                      <span className="text-lg shrink-0 mt-0.5">
                        {alertIcon(alert.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-ink">{alert.text}</p>
                        <p className="text-caption text-tertiary mt-1">
                          {timeAgo(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Properties */}
            {trending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-title text-ink">
                    Trending in {zipCode}
                  </h2>
                  <span className="text-[11px] font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full border border-amber/20">
                    Hot
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trending.map((listing) => {
                    const isRent = listing.listingType === "rent";
                    const priceDisplay = isRent
                      ? `$${listing.price.toLocaleString()}/mo`
                      : `$${listing.price.toLocaleString()}`;

                    return (
                      <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="bg-surface border border-divider rounded-card overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="flex gap-3 p-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-highlight shrink-0">
                            {listing.photo ? (
                              <img
                                src={listing.photo}
                                alt={listing.address}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-tertiary/30">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                >
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                  <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-caption font-semibold text-ink">
                              {priceDisplay}
                            </p>
                            <p className="text-caption text-secondary truncate">
                              {listing.address}
                            </p>
                            {listing.commentCount > 0 && (
                              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
                                💬 {listing.commentCount} take{listing.commentCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href={`/?zip=${zipCode}`}
                  className="block text-center mt-4 text-caption font-medium text-amber hover:text-amber/80 transition-colors"
                >
                  View all listings in {zipCode} →
                </Link>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Join CTA */}
            <div className="bg-gradient-to-br from-highlight to-surface border border-divider rounded-card p-5 sm:p-6">
              <h3 className="text-title text-ink mb-1">Join this community</h3>
              <p className="text-caption text-secondary mb-4">
                Verify your address to answer questions, post alerts, and connect
                with your neighbors.
              </p>
              <ZipVerification />
            </div>

            {/* How it works */}
            <div className="bg-surface border border-divider rounded-card p-5">
              <h3 className="text-body font-semibold text-ink mb-3">
                How it works
              </h3>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Verify your address",
                    desc: "Prove you live in the neighborhood",
                  },
                  {
                    step: "2",
                    title: "Ask or answer",
                    desc: "Share what you know about the area",
                  },
                  {
                    step: "3",
                    title: "Help your neighbors",
                    desc: "Build trust with real local knowledge",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-caption font-medium text-ink">
                        {item.title}
                      </p>
                      <p className="text-caption text-tertiary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community guidelines */}
            <div className="bg-surface border border-divider rounded-card p-5">
              <h3 className="text-body font-semibold text-ink mb-2">
                Community guidelines
              </h3>
              <ul className="space-y-1.5 text-caption text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-tertiary shrink-0" />
                  Be honest and helpful
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-tertiary shrink-0" />
                  Share from personal experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-tertiary shrink-0" />
                  Respect your neighbors&apos; privacy
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-tertiary shrink-0" />
                  No spam or self-promotion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
