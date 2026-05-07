import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotificationsList } from "./NotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?signin=1&returnTo=/notifications");
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
