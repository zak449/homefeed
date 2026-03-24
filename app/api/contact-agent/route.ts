import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAgentMessage } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 5 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const { listingId, senderName, senderEmail, message } = body ?? {};

  if (!listingId || !senderName || !senderEmail || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length < 5 || message.length > 2000) {
    return NextResponse.json({ error: "Message must be 5–2000 characters" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { address: true, agentName: true, agentEmail: true },
  });

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (!listing.agentEmail) {
    return NextResponse.json({ error: "No agent email on file for this listing" }, { status: 422 });
  }

  await sendAgentMessage({
    agentEmail: listing.agentEmail,
    agentName: listing.agentName ?? "the listing agent",
    senderName: senderName.trim(),
    senderEmail,
    message: message.trim(),
    listingAddress: listing.address,
  });

  return NextResponse.json({ ok: true });
}
