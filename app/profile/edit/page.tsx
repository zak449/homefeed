import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "./ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?signin=1&returnTo=/profile/edit");

  // Try to load the user; gracefully fall through if DB is unreachable.
  let user: { username: string | null; bio: string | null; avatarUrl: string | null; name: string | null } = {
    username: null,
    bio: null,
    avatarUrl: null,
    name: session.user.name ?? null,
  };
  try {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, bio: true, avatarUrl: true, name: true },
    });
    if (u) user = u;
  } catch {
    /* DB down — render with the session-derived defaults */
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">Edit your profile</h1>
      <p className="text-sm text-secondary mt-1">Pick a username, write a bio, drop in an avatar.</p>
      <ProfileEditForm initial={user} userIdSeed={session.user.id} />
    </div>
  );
}
