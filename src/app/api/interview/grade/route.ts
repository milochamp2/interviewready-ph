import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gradeAnswer } from "@/lib/ai";
import { gradeAnswerSchema } from "@/lib/validations";
import { getEntitlementInfo } from "@/lib/entitlement";
import { rateLimit } from "@/lib/rate-limit";
import type { FullInterviewPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = gradeAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, questionId, userAnswer } = parsed.data;

    // Rate limit
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success: rateLimited } = rateLimit(ip, "interview/grade");
    if (!rateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    // Gate: entitlement must be active and not expired/grace
    const entitlementInfo = await getEntitlementInfo(sessionId);
    if (entitlementInfo.status !== "active" || entitlementInfo.isGracePeriod) {
      return NextResponse.json(
        { success: false, error: "Active entitlement required for grading" },
        { status: 403 }
      );
    }

    // Find the question
    const interview = await prisma.interview.findUnique({
      where: { sessionId },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    const fullInterview = interview.fullJson as unknown as FullInterviewPayload;
    const question = fullInterview.questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Get session for role + language
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    // Grade via AI
    const result = await gradeAnswer(
      question.questionText,
      question.rubricBullets,
      userAnswer,
      session?.role || "va",
      session?.language || "en"
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to grade answer" },
      { status: 500 }
    );
  }
}
