import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEntitlementInfo } from "@/lib/entitlement";
import type { FullInterviewPayload } from "@/types";

// NOTE: Full PDF generation with @react-pdf/renderer should be implemented here.
// This is a placeholder that returns JSON data for the PDF content.
// In production, use @react-pdf/renderer server-side to generate actual PDF bytes.

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "session_id required" },
        { status: 400 }
      );
    }

    // Gate: entitlement active, NOT in grace period
    const entitlementInfo = await getEntitlementInfo(sessionId);
    if (entitlementInfo.status !== "active" || entitlementInfo.isGracePeriod) {
      return NextResponse.json(
        { success: false, error: "Active entitlement required for PDF" },
        { status: 403 }
      );
    }

    // Fetch session + interview data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { interview: true, bundleOutput: true },
    });

    if (!session || !session.interview) {
      return NextResponse.json(
        { success: false, error: "Interview data not found" },
        { status: 404 }
      );
    }

    const fullInterview = session.interview
      .fullJson as unknown as FullInterviewPayload;
    const isBundle = entitlementInfo.plan === "bundle_999";

    // TODO: Replace with actual PDF generation using @react-pdf/renderer
    // For now, return the data that would go into the PDF
    const pdfData = {
      readinessScore: fullInterview.readinessScore,
      readinessSummary: fullInterview.readinessSummary,
      questions: fullInterview.questions,
      role: session.role,
      language: session.language,
      ...(isBundle && session.bundleOutput
        ? {
            resumeOptimization: session.bundleOutput.resumeOutputJson,
            coverLetter: session.bundleOutput.coverLetterText,
          }
        : {}),
    };

    return NextResponse.json({
      success: true,
      data: pdfData,
      message:
        "PDF generation placeholder — implement with @react-pdf/renderer",
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
