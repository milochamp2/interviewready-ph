import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSchema } from "@/lib/validations";
import { createCheckoutSession } from "@/lib/paymongo";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, plan } = parsed.data;

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // For extensions, check max 2
    if (plan === "extend_149") {
      const entitlement = await prisma.entitlement.findUnique({
        where: { sessionId },
      });
      if (entitlement && entitlement.extensionsUsed >= 2) {
        return NextResponse.json(
          { success: false, error: "Maximum extensions reached (2)" },
          { status: 400 }
        );
      }
    }

    const checkoutUrl = await createCheckoutSession(sessionId, plan);

    return NextResponse.json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
