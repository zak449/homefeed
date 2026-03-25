import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = getClientIp(request);
    const { success } = rateLimit(ip, { interval: 60_000, maxRequests: 10 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing required query parameter: email" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Run 3 parallel Prisma queries
    const [comments, questions, resident] = await Promise.all([
      prisma.comment.findMany({
        where: { email },
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              id: true,
              address: true,
              city: true,
              photos: true,
            },
          },
        },
      }),
      prisma.neighborQuestion.findMany({
        where: { askerEmail: email },
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { answers: true } },
        },
      }),
      prisma.verifiedResident.findUnique({
        where: { email },
        include: {
          answers: {
            take: 50,
            orderBy: { createdAt: "desc" },
            include: {
              question: {
                select: { question: true, listingId: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        listing: c.listing
          ? {
              id: c.listing.id,
              address: c.listing.address,
              city: c.listing.city,
              photo: c.listing.photos?.[0] ?? null,
            }
          : null,
      })),
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
        createdAt: q.createdAt,
        answerCount: q._count.answers,
        listingId: q.listingId,
      })),
      answers: (resident?.answers ?? []).map((a) => ({
        id: a.id,
        content: a.content,
        createdAt: a.createdAt,
        questionText: a.question.question,
        listingId: a.question.listingId,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
