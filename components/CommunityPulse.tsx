import { prisma } from "@/lib/prisma";

export default async function CommunityPulse() {
  const [commentCount, reactionCount, listingCount] = await Promise.all([
    prisma.comment.count(),
    prisma.reaction.count(),
    prisma.listing.count({ where: { status: "active" } }),
  ]);

  if (commentCount === 0 && reactionCount === 0) return null;

  return (
    <p className="text-caption text-tertiary">
      {commentCount.toLocaleString()} opinions
      {reactionCount > 0 && ` \u00b7 ${reactionCount.toLocaleString()} reactions`}
      {listingCount > 0 && ` \u00b7 ${listingCount.toLocaleString()} listings`}
    </p>
  );
}
