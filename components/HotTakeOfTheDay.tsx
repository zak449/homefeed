import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HotTakeOfTheDay() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const hotComment = await prisma.comment.findFirst({
    where: {
      createdAt: { gte: sevenDaysAgo },
      reactions: { some: {} },
    },
    orderBy: {
      reactions: { _count: "desc" },
    },
    select: {
      id: true,
      name: true,
      content: true,
      createdAt: true,
      reactions: {
        select: { type: true },
      },
      listing: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          photos: true,
        },
      },
    },
  });

  const comment = hotComment ?? await prisma.comment.findFirst({
    where: { reactions: { some: {} } },
    orderBy: { reactions: { _count: "desc" } },
    select: {
      id: true,
      name: true,
      content: true,
      createdAt: true,
      reactions: {
        select: { type: true },
      },
      listing: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          photos: true,
        },
      },
    },
  });

  if (!comment) return null;

  const { listing } = comment;
  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const reactionCounts: Record<string, number> = {};
  for (const r of comment.reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  }

  const initials = comment.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block bg-highlight rounded-card px-5 py-5 hover:shadow-soft transition-shadow"
    >
      <p className="text-caption text-tertiary mb-3">Featured Take</p>

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-avatar bg-active flex items-center justify-center text-xs font-semibold text-ink shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center gap-1.5">
            <span className="text-title text-ink">{comment.name}</span>
          </div>

          {/* Listing context */}
          <p className="text-caption text-tertiary mt-0.5 truncate">
            on {price} &middot; {listing.address}, {listing.city}
          </p>

          {/* Comment */}
          <p className="text-body text-ink mt-2 leading-relaxed">
            &ldquo;{comment.content.length > 200
              ? comment.content.slice(0, 200) + "..."
              : comment.content}&rdquo;
          </p>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span key={emoji} className="text-caption text-tertiary">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
