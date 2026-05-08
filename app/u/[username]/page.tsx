import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/profile/Avatar";
import { StreakBadge } from "@/components/profile/StreakBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — Gwaky`,
    description: `${username}'s takes on real estate listings.`,
  };
}

export default async function PublicProfile({ params }: PageProps) {
  const { username } = await params;
  let user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    avatarUrl: string | null;
    streakCount: number;
    createdAt: Date;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        streakCount: true,
        createdAt: true,
      },
    });
  } catch {
    // DB unreachable — show a graceful "this profile is unavailable right now" state.
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Profile unavailable</h1>
        <p className="text-sm text-secondary mt-2">
          We couldn&rsquo;t reach the database. Try again in a moment.
        </p>
      </div>
    );
  }

  if (!user) notFound();

  let recentComments: { id: string; content: string; createdAt: Date; listingId: string }[] = [];
  try {
    recentComments = await prisma.comment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, content: true, createdAt: true, listingId: true },
    });
  } catch {
    /* ignore */
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center gap-4">
        <Avatar src={user.avatarUrl} seed={user.id} label={user.name ?? user.username ?? "User"} size={80} />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {user.name ?? `@${user.username}`}
          </h1>
          {user.username && <p className="text-sm text-secondary">@{user.username}</p>}
          <div className="mt-2"><StreakBadge days={user.streakCount} /></div>
        </div>
      </div>
      {user.bio && <p className="mt-5 text-base text-ink leading-relaxed">{user.bio}</p>}

      <h2 className="mt-10 font-display text-lg font-bold text-ink">Recent takes</h2>
      <ul className="mt-4 space-y-4">
        {recentComments.length === 0 && (
          <li className="text-sm text-secondary">No takes yet.</li>
        )}
        {recentComments.map((c) => (
          <li key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm text-ink">{c.content}</p>
            <Link
              href={`/listing/${c.listingId}`}
              className="mt-2 inline-block text-xs font-semibold text-amber hover:underline"
            >
              View listing →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
