import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 15_000;
const MAX_LIFETIME_MS = 5 * 60_000; // close after 5 minutes; client reconnects

/**
 * Server-Sent Events stream of notification changes.
 *
 * Implementation note: we don't have Postgres LISTEN/NOTIFY wired here,
 * so this is an internal poll that surfaces changes to clients via SSE
 * (so the client doesn't have to manage its own polling cadence).
 * Clients fall back to plain 30s polling if EventSource fails.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  let lastCount = -1;
  let lastLatestId: string | null = null;
  const startedAt = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      function send(event: string, data: unknown) {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }
      send("hello", { ok: true });

      async function tick(): Promise<boolean> {
        try {
          const [unread, latest] = await Promise.all([
            prisma.notification.count({ where: { userId, read: false } }),
            prisma.notification.findFirst({
              where: { userId },
              orderBy: { createdAt: "desc" },
              select: { id: true },
            }),
          ]);
          const latestId = latest?.id ?? null;
          if (lastCount !== -1 && (unread !== lastCount || latestId !== lastLatestId)) {
            send("notification", { unread, latestId });
          }
          lastCount = unread;
          lastLatestId = latestId;
          return true;
        } catch {
          // DB unreachable — close so client falls back to polling
          send("error", { message: "database unreachable" });
          return false;
        }
      }

      while (Date.now() - startedAt < MAX_LIFETIME_MS) {
        const ok = await tick();
        if (!ok) break;
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
    },
  });
}
