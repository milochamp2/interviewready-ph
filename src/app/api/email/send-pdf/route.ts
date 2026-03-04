import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPdfEmailSchema } from "@/lib/validations";
import { getEntitlementInfo } from "@/lib/entitlement";

// NOTE: In production, implement actual email sending with nodemailer.
// This is a placeholder that records the email request.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendPdfEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, email } = parsed.data;

    // Gate: entitlement active
    const entitlementInfo = await getEntitlementInfo(sessionId);
    if (entitlementInfo.status !== "active" || entitlementInfo.isGracePeriod) {
      return NextResponse.json(
        { success: false, error: "Active entitlement required" },
        { status: 403 }
      );
    }

    // Record the email request
    await prisma.emailRequest.create({
      data: {
        sessionId,
        email,
        pdfSentAt: new Date(),
      },
    });

    // TODO: Generate PDF and send via nodemailer
    // const transporter = nodemailer.createTransport({...})
    // await transporter.sendMail({...})

    return NextResponse.json({
      success: true,
      message: "PDF email queued",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
