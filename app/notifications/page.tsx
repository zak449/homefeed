import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { NotificationsList } from "./NotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?signin=1&returnTo=/notifications");
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Your tea</h1>
          <p className="text-secondary text-caption mt-1">Replies, reactions, and red flags on takes you&apos;ve dropped.</p>
        </div>
        <Link href="/profile" className="tea-pill" aria-label="Back to your profile">Profile →</Link>
      </div>

      <NotificationsList />

      {/* Speed-of-loop CTAs — never let the user dead-end on the inbox */}
      <div className="grid sm:grid-cols-2 gap-3 pt-4">
        <Link href="/hot-takes" className="next-up-cta block">
          <span className="flex items-center gap-3">
            <span aria-hidden>🔥</span>
            <span><span className="block text-tag uppercase tracking-wider text-tea-300">All caught up</span><span className="block text-body text-ink">See what&apos;s boiling now</span></span>
          </span>
        </Link>
        <Link href="/saved" className="next-up-cta block">
          <span className="flex items-center gap-3">
            <span aria-hidden>🌡️</span>
            <span><span className="block text-tag uppercase tracking-wider text-tea-300">Watchlist update</span><span className="block text-body text-ink">Check your tracked listings</span></span>
          </span>
        </Link>
      </div>
    </div>
  );
}
