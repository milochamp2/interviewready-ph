import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(ip, "session/create");
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const session = await prisma.session.create({
      data: {
        language: data.language,
        identityType: data.identityType,
        importanceLevel: data.importanceLevel,
        worry: data.worry,
        failedBefore: data.failedBefore,
        role: data.role,
        experienceLevel: data.experienceLevel,
        interviewTiming: data.interviewTiming,
        jobDescription: data.jobDescription || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: session.id },
    });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
