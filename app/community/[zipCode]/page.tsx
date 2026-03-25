import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ZipVerification from "@/components/ZipVerification";
import NeighborQA from "@/components/NeighborQA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zipCode: string }>;
}) {
  const { zipCode } = await params;
  return {
    title: `${zipCode} Community — Gwaky`,
    description: `Join the ${zipCode} community. Real takes, local Q&A, and neighborhood intel from verified residents.`,
  };
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function badgeLabel(badge: string) {
  switch (badge) {
    case "legend":
      return { text: "Legend", color: "text-amber bg-amber/10 border-amber/20" };
    case "veteran":
      return { text: "Veteran", color: "text-purple-600 bg-purple-50 border-purple-200" };
    case "local":
      return { text: "Local", color: "text-green-700 bg-green-50 border-green-200" };
    default:
      return { text: "Newcomer", color: "text-secondary bg-highlight border-divider" };
  }
}

function alertTypeStyle(type: string) {
  switch (type) {
    case "warning":
      return {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        ),
        bg: "bg-red-50 border-red-200",
        iconColor: "text-red-500",
      };
    case "tip":
      return {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        ),
        bg: "bg-blue-50 border-blue-200",
        iconColor: "text-blue-500",
      };
    case "update":
      return {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        ),
        bg: "bg-amber/5 border-amber/20",
        iconColor: "text-amber",
      };
    default:
      return {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        ),
        bg: "bg-highlight border-divider",
        iconColor: "text-secondary",
      };
  }
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ zipCode: string }>;
}) {
  const { zipCode } = await params;

  // ── Parallel Prisma queries ────────────────────────────────
  const [community, recentComments, listings, questions, alerts, topContributors] =
    await Promise.all([
      // Community meta
      prisma.zipCommunity.findUnique({ where: { zipCode } }),

      // "What's happening" — latest takes (comments) from listings in this zip
      prisma.comment.findMany({
        where: { listing: { zip: zipCode } },
        include: {
          listing: {
            select: { id: true, address: true, price: true, listingType: true },
          },
          reactions: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),

      // Active listings in this area
      prisma.listing.findMany({
        where: { zip: zipCode, status: "active" },
        include: { _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),

      // Questions count for stats
      prisma.neighborQuestion.count({ where: { zipCode } }),

      // Community alerts
      prisma.communityAlert.findMany({
        where: { zipCode, isActive: true },
        include: {
          createdBy: { select: { name: true, badge: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Top contributors
      prisma.verifiedResident.findMany({
        where: { zipCode },
        orderBy: { reputation: "desc" },
        select: {
          id: true,
          name: true,
          badge: true,
          reputation: true,
          _count: { select: { answers: true, questions: true } },
        },
        take: 5,
      }),
    ]);

  const cityName = community?.city ?? "";
  const stateName = community?.state ?? "";
  const memberCount = community?.memberCount ?? 0;
  const totalTakes = community?.totalTakes ?? 0;
  const activeDiscussions = community?.activeDiscussions ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-caption text-secondary mb-8">
          <Link href="/" className="hover:text-ink transition-colors">
            Gwaky
          </Link>
          <span>/</span>
          <Link
            href="/community"
            className="hover:text-ink transition-colors"
          >
            communities
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{zipCode}</span>
        </nav>

        {/* ── 1. HERO ──────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-card bg-gradient-to-br from-amber/15 to-amber/5 border border-amber/20 flex items-center justify-center shrink-0 shadow-glow">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-display text-ink tracking-tight leading-tight">
                {zipCode}
                {cityName && (
                  <span className="text-secondary font-normal text-headline sm:text-display">
                    {" "}
                    &mdash; {cityName}
                    {stateName ? `, ${stateName}` : ""}
                  </span>
                )}
              </h1>
              <p className="text-body text-secondary mt-1.5 max-w-xl">
                Your neighborhood&apos;s living room. Real takes, local answers,
                and the pulse of your block.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-full shadow-card">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-caption font-semibold text-ink">
                {memberCount.toLocaleString()} member
                {memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            {totalTakes > 0 && (
              <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-full shadow-card">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="text-caption font-semibold text-ink">
                  {totalTakes.toLocaleString()} take
                  {totalTakes !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {activeDiscussions > 0 && (
              <div className="flex items-center gap-2 bg-amber/10 border border-amber/20 px-4 py-2 rounded-full shadow-glow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-caption font-semibold text-amber">
                  {activeDiscussions} active thread
                  {activeDiscussions !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {questions > 0 && (
              <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-full shadow-card">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-caption font-semibold text-ink">
                  {questions} question{questions !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ── MAIN GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN — feed + content */}
          <div className="lg:col-span-2 space-y-10">
            {/* ── 2. WHAT'S HAPPENING — live take feed ───── */}
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <h2 className="text-headline text-ink">What&apos;s happening</h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
                </span>
              </div>

              {recentComments.length > 0 ? (
                <div className="space-y-3">
                  {recentComments.map((comment) => {
                    const listing = comment.listing;
                    const isRent = listing.listingType === "rent";
                    const priceStr = isRent
                      ? `$${listing.price.toLocaleString()}/mo`
                      : `$${listing.price.toLocaleString()}`;
                    const reactionCount = comment.reactions.length;

                    return (
                      <Link
                        key={comment.id}
                        href={`/listing/${listing.id}`}
                        className="block bg-surface border border-divider rounded-card p-4 sm:p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar circle */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber/20 to-amber/5 border border-amber/15 flex items-center justify-center shrink-0 text-caption font-bold text-amber">
                            {comment.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-caption font-semibold text-ink">
                                {comment.name}
                              </span>
                              <span className="text-caption text-tertiary">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-body text-ink/90 mt-1 leading-relaxed line-clamp-2">
                              {comment.content}
                            </p>
                            {/* Listing context */}
                            <div className="flex items-center gap-2 mt-2.5 text-caption text-secondary">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                              <span className="truncate">
                                {listing.address}
                              </span>
                              <span className="text-tertiary">&middot;</span>
                              <span className="font-semibold text-ink shrink-0">
                                {priceStr}
                              </span>
                            </div>
                            {reactionCount > 0 && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 text-[11px] text-tertiary">
                                  {reactionCount} reaction
                                  {reactionCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-card bg-surface border border-divider">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-tertiary/40 mb-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p className="text-title text-ink mb-1">No takes yet</p>
                  <p className="text-body text-secondary">
                    Be the first to drop a take on a listing in {zipCode}.
                  </p>
                </div>
              )}
            </section>

            {/* ── 3. ACTIVE LISTINGS ─────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-headline text-ink">
                    Active listings
                  </h2>
                  {listings.length > 0 && (
                    <span className="text-[11px] font-semibold text-amber bg-amber/10 px-2.5 py-0.5 rounded-full border border-amber/20">
                      {listings.length}
                    </span>
                  )}
                </div>
                <Link
                  href={`/?zip=${zipCode}`}
                  className="text-caption font-medium text-amber hover:text-amber/80 transition-colors"
                >
                  View all &rarr;
                </Link>
              </div>

              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listings.map((listing) => {
                    const isRent = listing.listingType === "rent";
                    const priceDisplay = isRent
                      ? `$${listing.price.toLocaleString()}/mo`
                      : `$${listing.price.toLocaleString()}`;
                    const photo = listing.photos?.[0];
                    const commentCount = listing._count.comments;

                    return (
                      <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="bg-surface border border-divider rounded-card overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        {/* Photo */}
                        <div className="relative h-32 bg-highlight overflow-hidden">
                          {photo ? (
                            <img
                              src={photo}
                              alt={listing.address}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-tertiary/25"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            </div>
                          )}
                          {/* Type badge */}
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-ink backdrop-blur-sm">
                              {listing.listingType === "rent" ? "Rent" : "Sale"}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-title text-ink">
                              {priceDisplay}
                            </span>
                            {commentCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                {commentCount}
                              </span>
                            )}
                          </div>
                          <p className="text-caption text-secondary truncate">
                            {listing.address}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-caption text-tertiary">
                            {listing.bedrooms != null && (
                              <span>{listing.bedrooms} bd</span>
                            )}
                            {listing.bathrooms != null && (
                              <>
                                <span>&middot;</span>
                                <span>{listing.bathrooms} ba</span>
                              </>
                            )}
                            {listing.sqft != null && (
                              <>
                                <span>&middot;</span>
                                <span>{listing.sqft.toLocaleString()} sqft</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-card bg-surface border border-divider">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-tertiary/40 mb-3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <p className="text-title text-ink mb-1">No active listings</p>
                  <p className="text-body text-secondary">
                    Nothing on the market in {zipCode} right now.
                  </p>
                </div>
              )}
            </section>

            {/* ── 4. NEIGHBOR Q&A ────────────────────────── */}
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

            {/* ── 5. COMMUNITY ALERTS ────────────────────── */}
            {alerts.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <h2 className="text-headline text-ink">Community alerts</h2>
                  <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    {alerts.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {alerts.map((alert) => {
                    const style = alertTypeStyle(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 rounded-card px-4 py-3.5 border ${style.bg}`}
                      >
                        <span className={`shrink-0 mt-0.5 ${style.iconColor}`}>
                          {style.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-body text-ink leading-relaxed">
                            {alert.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-caption text-secondary font-medium">
                              {alert.createdBy.name}
                            </span>
                            {alert.createdBy.badge !== "newcomer" && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                                  badgeLabel(alert.createdBy.badge).color
                                }`}
                              >
                                {badgeLabel(alert.createdBy.badge).text}
                              </span>
                            )}
                            <span className="text-caption text-tertiary">
                              {timeAgo(alert.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────── */}
          <div className="space-y-6">
            {/* ── 6. JOIN CTA ────────────────────────────── */}
            <div className="bg-gradient-to-br from-amber/5 to-surface border border-amber/15 rounded-card p-5 sm:p-6 shadow-glow">
              <div className="flex items-center gap-2 mb-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <h3 className="text-title text-ink">Join {zipCode}</h3>
              </div>
              <p className="text-caption text-secondary mb-4">
                Verify your address to answer questions, post alerts, and rep
                your block.
              </p>
              <ZipVerification />
            </div>

            {/* ── 7. MEMBER HIGHLIGHTS ───────────────────── */}
            {topContributors.length > 0 && (
              <div className="bg-surface border border-divider rounded-card p-5">
                <h3 className="text-body font-semibold text-ink mb-4">
                  Top neighbors
                </h3>
                <div className="space-y-3.5">
                  {topContributors.map((resident, i) => {
                    const badge = badgeLabel(resident.badge);
                    const totalContributions =
                      resident._count.answers + resident._count.questions;

                    return (
                      <div
                        key={resident.id}
                        className="flex items-center gap-3"
                      >
                        {/* Rank */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                            i === 0
                              ? "bg-amber/15 text-amber border border-amber/20"
                              : i === 1
                              ? "bg-highlight text-secondary border border-divider"
                              : i === 2
                              ? "bg-highlight text-secondary border border-divider"
                              : "bg-bg text-tertiary border border-divider"
                          }`}
                        >
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-caption font-semibold text-ink truncate">
                              {resident.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${badge.color}`}
                            >
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-[11px] text-tertiary mt-0.5">
                            {totalContributions} contribution
                            {totalContributions !== 1 ? "s" : ""}
                            {resident.reputation > 0 &&
                              ` \u00B7 ${resident.reputation} rep`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                    title: "Drop takes & ask questions",
                    desc: "Share what you know about the area",
                  },
                  {
                    step: "3",
                    title: "Build your rep",
                    desc: "Earn badges by helping neighbors",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#F5F5F5] text-[#0E0E0E] flex items-center justify-center text-[12px] font-bold shrink-0">
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
                {[
                  "Be honest and helpful",
                  "Share from personal experience",
                  "Respect your neighbors\u2019 privacy",
                  "No spam or self-promotion",
                ].map((rule) => (
                  <li key={rule} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber/60 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick link back to listings */}
            <Link
              href={`/?zip=${zipCode}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-button border border-divider bg-surface text-caption font-medium text-ink hover:border-amber/40 hover:shadow-glow transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Browse all {zipCode} listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
