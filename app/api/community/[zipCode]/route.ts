import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ zipCode: string }> }
) {
  try {
    const { zipCode } = await params;

    // Get community stats
    const community = await prisma.zipCommunity.findUnique({
      where: { zipCode },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found for this zip code" },
        { status: 404 }
      );
    }

    // Latest questions with their answers
    const questions = await prisma.neighborQuestion.findMany({
      where: { zipCode },
      include: {
        answers: {
          include: {
            answeredBy: { select: { id: true, name: true, badge: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        askedBy: { select: { id: true, name: true, badge: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Recent active alerts
    const alerts = await prisma.communityAlert.findMany({
      where: { zipCode, isActive: true },
      include: {
        createdBy: { select: { id: true, name: true, badge: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Top contributors — residents with the most answers in this community
    const topContributors = await prisma.verifiedResident.findMany({
      where: { zipCode },
      orderBy: { reputation: "desc" },
      select: {
        id: true,
        name: true,
        badge: true,
        reputation: true,
        _count: { select: { answers: true } },
      },
      take: 10,
    });

    return NextResponse.json({
      community: {
        zipCode: community.zipCode,
        city: community.city,
        state: community.state,
        memberCount: community.memberCount,
        totalTakes: community.totalTakes,
        activeDiscussions: community.activeDiscussions,
      },
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
        status: q.status,
        askedByName: q.askedBy?.name ?? q.askedByName ?? "Anonymous",
        upvotes: q.upvotes,
        createdAt: q.createdAt,
        answers: q.answers.map((a) => ({
          id: a.id,
          content: a.content,
          answeredBy: a.answeredBy,
          upvotes: a.upvotes,
          createdAt: a.createdAt,
        })),
      })),
      alerts: alerts.map((a) => ({
        id: a.id,
        content: a.content,
        type: a.type,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
      })),
      topContributors: topContributors.map((r) => ({
        id: r.id,
        name: r.name,
        badge: r.badge,
        reputation: r.reputation,
        answerCount: r._count.answers,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
