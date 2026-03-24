import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get("zipCode");
    const listingId = searchParams.get("listingId");

    if (!zipCode && !listingId) {
      return NextResponse.json(
        { error: "Provide zipCode or listingId as a query parameter" },
        { status: 400 }
      );
    }

    const where: Record<string, string> = {};
    if (zipCode) where.zipCode = zipCode;
    if (listingId) where.listingId = listingId;

    const questions = await prisma.neighborQuestion.findMany({
      where,
      include: {
        _count: { select: { answers: true } },
        askedBy: { select: { id: true, name: true, badge: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = questions.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category,
      zipCode: q.zipCode,
      listingId: q.listingId,
      askedByName: q.askedBy?.name ?? q.askedByName ?? "Anonymous",
      askedByBadge: q.askedBy?.badge ?? null,
      upvotes: q.upvotes,
      status: q.status,
      answerCount: q._count.answers,
      createdAt: q.createdAt,
    }));

    return NextResponse.json({ questions: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, category, zipCode, listingId, askedById, askedByName } =
      body;

    if (!question || !zipCode) {
      return NextResponse.json(
        { error: "Missing required fields: question, zipCode" },
        { status: 400 }
      );
    }

    // Ensure the community exists
    const community = await prisma.zipCommunity.findUnique({
      where: { zipCode },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found for this zip code. Verify a resident first." },
        { status: 404 }
      );
    }

    const newQuestion = await prisma.neighborQuestion.create({
      data: {
        question,
        category: category || "general",
        zipCode,
        listingId: listingId || null,
        askedById: askedById || null,
        askedByName: askedByName || null,
      },
    });

    // Increment active discussions count
    await prisma.zipCommunity.update({
      where: { zipCode },
      data: { activeDiscussions: { increment: 1 } },
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
