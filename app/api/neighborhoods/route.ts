import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get listing stats grouped by city
    const cityStats = await prisma.listing.groupBy({
      by: ["city", "state"],
      where: { status: "active" },
      _count: true,
      _avg: { price: true },
    });

    // Get comment counts per city
    const commentStats = await prisma.$queryRaw<
      { city: string; comment_count: bigint }[]
    >`
      SELECT l.city, COUNT(c.id)::bigint AS comment_count
      FROM "Listing" l
      JOIN "Comment" c ON c."listingId" = l.id
      WHERE l.status = 'active'
      GROUP BY l.city
    `;

    const commentMap: Record<string, number> = {};
    for (const row of commentStats) {
      commentMap[row.city] = Number(row.comment_count);
    }

    // Get reaction counts per city, broken down by type
    const reactionStats = await prisma.$queryRaw<
      { city: string; type: string; reaction_count: bigint }[]
    >`
      SELECT l.city, r.type, COUNT(r.id)::bigint AS reaction_count
      FROM "Listing" l
      JOIN "Comment" c ON c."listingId" = l.id
      JOIN "Reaction" r ON r."commentId" = c.id
      WHERE l.status = 'active'
      GROUP BY l.city, r.type
    `;

    const reactionMap: Record<string, Record<string, number>> = {};
    for (const row of reactionStats) {
      if (!reactionMap[row.city]) reactionMap[row.city] = {};
      reactionMap[row.city][row.type] = Number(row.reaction_count);
    }

    // Build response
    const neighborhoods = cityStats.map((cs) => {
      const comments = commentMap[cs.city] ?? 0;
      const reactions = reactionMap[cs.city] ?? {};

      // Find top reaction
      let topReaction = "";
      let topReactionCount = 0;
      for (const [emoji, count] of Object.entries(reactions)) {
        if (count > topReactionCount) {
          topReaction = emoji;
          topReactionCount = count;
        }
      }

      return {
        city: cs.city,
        state: cs.state,
        listingCount: cs._count,
        commentCount: comments,
        avgPrice: Math.round(cs._avg.price ?? 0),
        reactions,
        topReaction,
      };
    });

    // Sort by comment count descending, take top 20
    neighborhoods.sort((a, b) => b.commentCount - a.commentCount);
    const top20 = neighborhoods.slice(0, 20);

    return NextResponse.json(top20);
  } catch (error) {
    console.error("[API /neighborhoods] Error:", error);
    return NextResponse.json({ error: "Failed to fetch neighborhoods" }, { status: 500 });
  }
}
