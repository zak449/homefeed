import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const body = await request.json();
    const { content, answeredById } = body;

    if (!content || !answeredById) {
      return NextResponse.json(
        { error: "Missing required fields: content, answeredById" },
        { status: 400 }
      );
    }

    // Verify the question exists
    const question = await prisma.neighborQuestion.findUnique({
      where: { id: questionId },
      include: { _count: { select: { answers: true } } },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Verify the answerer is a resident
    const resident = await prisma.verifiedResident.findUnique({
      where: { id: answeredById },
    });

    if (!resident) {
      return NextResponse.json(
        { error: "Only verified residents can answer questions" },
        { status: 403 }
      );
    }

    // Create the answer
    const answer = await prisma.neighborAnswer.create({
      data: {
        content,
        questionId,
        answeredById,
      },
      include: {
        answeredBy: { select: { id: true, name: true, badge: true } },
      },
    });

    // If this is the first answer, mark the question as "answered"
    if (question._count.answers === 0) {
      await prisma.neighborQuestion.update({
        where: { id: questionId },
        data: { status: "answered" },
      });
    }

    // Increment the answerer's reputation
    await prisma.verifiedResident.update({
      where: { id: answeredById },
      data: { reputation: { increment: 1 } },
    });

    return NextResponse.json({ success: true, answer }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
