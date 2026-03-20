import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HotTakeOfTheDay() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find the comment with the most reactions in the past 7 days
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

  // Fallback: if no reactions in 7 days, grab the most recent comment with any reactions
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
  const photo = listing.photos[0];
  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  // Aggregate reaction emojis for display
  const reactionCounts: Record<string, number> = {};
  for (const r of comment.reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  }
  const totalReactions = comment.reactions.length;

  return (
    <section className="my-8 sm:my-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">&#x1F525;</span>
        <h2 className="font-display text-base font-bold text-ink uppercase tracking-widest">
          Hot Take of the Day
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-social/30 to-transparent" />
      </div>

      <Link
        href={`/listing/${listing.id}`}
        className="group block relative rounded-2xl overflow-hidden hot-take-card"
      >
        {/* Blurred background photo */}
        {photo && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ink/80 via-ink/70 to-social/40" />
          </div>
        )}
        {!photo && (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-social/30" />
        )}

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-start gap-5">
          {/* Quote */}
          <div className="max-w-2xl">
            <span className="text-social text-4xl sm:text-5xl font-display leading-none select-none">&ldquo;</span>
            <p className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug tracking-tight -mt-4 sm:-mt-6">
              {comment.content.length > 200
                ? comment.content.slice(0, 200) + "..."
                : comment.content}
            </p>
          </div>

          {/* Attribution */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-social/30 flex items-center justify-center text-white font-bold text-sm">
              {comment.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white/90">{comment.name}</span>
          </div>

          {/* Reactions row */}
          {totalReactions > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm text-white"
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{count}</span>
                </span>
              ))}
              <span className="text-xs text-white/50 ml-1">
                {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-white/10" />

          {/* Listing info + CTA */}
          <div className="flex items-end justify-between w-full gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Small listing thumbnail */}
              {photo && (
                <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/20 shrink-0 hidden sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={listing.address}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-white font-display text-lg font-bold tracking-tight">
                  {price}
                </p>
                <p className="text-white/60 text-sm">
                  {listing.address}, {listing.city}, {listing.state}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-social bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-social group-hover:text-white transition-all duration-300">
              Join the conversation
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
