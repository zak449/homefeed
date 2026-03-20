import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TrendingTabs from "./TrendingTabs";

export const metadata: Metadata = {
  title: "Trending Conversations — homefeed",
  description:
    "See which listings people are talking about the most. Real opinions on real estate.",
};

export default async function TrendingPage() {
  // Most Discussed — sorted by comment count
  const mostDiscussed = await prisma.listing.findMany({
    where: { status: "active" },
    orderBy: { comments: { _count: "desc" } },
    take: 20,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      photos: true,
      _count: { select: { comments: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        select: { name: true, content: true },
      },
    },
  });

  // Most Reactions — listings whose comments have the most reactions
  const topReactedComments = await prisma.comment.findMany({
    orderBy: { reactions: { _count: "desc" } },
    take: 40,
    select: {
      listingId: true,
      name: true,
      content: true,
      _count: { select: { reactions: true } },
    },
  });

  // Deduplicate by listing, keep the top comment per listing
  const seenListingIds = new Set<string>();
  const topListingIds: string[] = [];
  const topCommentByListing: Record<string, { name: string; content: string; reactionCount: number }[]> = {};
  for (const c of topReactedComments) {
    if (!topCommentByListing[c.listingId]) {
      topCommentByListing[c.listingId] = [];
    }
    if (topCommentByListing[c.listingId].length < 2) {
      topCommentByListing[c.listingId].push({
        name: c.name,
        content: c.content,
        reactionCount: c._count.reactions,
      });
    }
    if (!seenListingIds.has(c.listingId)) {
      seenListingIds.add(c.listingId);
      topListingIds.push(c.listingId);
    }
  }

  const mostReactedListings = topListingIds.length > 0
    ? await prisma.listing.findMany({
        where: { id: { in: topListingIds.slice(0, 20) }, status: "active" },
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          photos: true,
          _count: { select: { comments: true } },
        },
      })
    : [];

  // Maintain the order from topListingIds
  const orderedMostReacted = topListingIds
    .map((id) => mostReactedListings.find((l) => l.id === id))
    .filter(Boolean)
    .map((listing) => ({
      ...listing!,
      comments: topCommentByListing[listing!.id] ?? [],
    }));

  // Newest Hot Takes — most recent listings that already have comments
  const newestHotTakes = await prisma.listing.findMany({
    where: {
      status: "active",
      comments: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      photos: true,
      _count: { select: { comments: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        select: { name: true, content: true },
      },
    },
  });

  // Normalize data shapes for the client component
  const tabs = [
    {
      id: "discussed" as const,
      label: "Most Discussed",
      listings: mostDiscussed.map((l) => ({
        id: l.id,
        address: l.address,
        city: l.city,
        state: l.state,
        price: l.price,
        listingType: l.listingType,
        photo: l.photos[0] ?? null,
        commentCount: l._count.comments,
        comments: l.comments.map((c) => ({ name: c.name, content: c.content })),
      })),
    },
    {
      id: "reactions" as const,
      label: "Most Reactions",
      listings: orderedMostReacted.map((l) => ({
        id: l.id,
        address: l.address,
        city: l.city,
        state: l.state,
        price: l.price,
        listingType: l.listingType,
        photo: l.photos[0] ?? null,
        commentCount: l._count.comments,
        comments: l.comments.map((c) => ({ name: c.name, content: c.content })),
      })),
    },
    {
      id: "newest" as const,
      label: "Newest Hot Takes",
      listings: newestHotTakes.map((l) => ({
        id: l.id,
        address: l.address,
        city: l.city,
        state: l.state,
        price: l.price,
        listingType: l.listingType,
        photo: l.photos[0] ?? null,
        commentCount: l._count.comments,
        comments: l.comments.map((c) => ({ name: c.name, content: c.content })),
      })),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to homefeed
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-social animate-activity-pulse" />
          <p className="text-[11px] font-bold text-social tracking-widest uppercase">
            Live
          </p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter">
          Trending{" "}
          <span className="social-gradient">Conversations</span>
        </h1>
        <p className="text-base text-muted mt-3 leading-relaxed max-w-lg">
          The listings people can&rsquo;t stop talking about. Real-time
          leaderboard of the hottest discussions on homefeed.
        </p>
      </div>

      <TrendingTabs tabs={tabs} />
    </div>
  );
}
