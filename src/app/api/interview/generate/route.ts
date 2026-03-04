import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInterview, extractTeaser } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import type { QuestionnaireAnswers } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "session_id required" },
        { status: 400 }
      );
    }

    // Rate limit
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success: rateLimited } = rateLimit(ip, "interview/generate");
    if (!rateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    // Check if interview already exists (cache per session_id)
    const existing = await prisma.interview.findUnique({
      where: { sessionId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { teaser: existing.teaserJson },
      });
    }

    // Fetch session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Generate via AI
    const answers: QuestionnaireAnswers = {
      language: session.language as "en" | "tl",
      identityType: session.identityType as QuestionnaireAnswers["identityType"],
      importanceLevel: session.importanceLevel as QuestionnaireAnswers["importanceLevel"],
      worry: session.worry as QuestionnaireAnswers["worry"],
      failedBefore: session.failedBefore as QuestionnaireAnswers["failedBefore"],
      role: session.role as QuestionnaireAnswers["role"],
      experienceLevel: session.experienceLevel as QuestionnaireAnswers["experienceLevel"],
      interviewTiming: session.interviewTiming as QuestionnaireAnswers["interviewTiming"],
      jobDescription: session.jobDescription || undefined,
    };

    const fullInterview = await generateInterview(answers);
    const teaser = extractTeaser(fullInterview);

    // Store both teaser and full interview
    await prisma.interview.create({
      data: {
        sessionId,
        teaserJson: teaser as any,
        fullJson: fullInterview as any,
      },
    });

    // Store readiness score on session
    await prisma.session.update({
      where: { id: sessionId },
      data: { readinessScore: fullInterview.readinessScore },
    });

    return NextResponse.json({
      success: true,
      data: { teaser },
    });
  } catch (error) {
    console.error("Interview generate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}
