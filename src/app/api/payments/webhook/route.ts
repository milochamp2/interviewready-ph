import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, validatePaymentAmount } from "@/lib/paymongo";
import { activateEntitlement, extendEntitlement } from "@/lib/entitlement";
import { prisma } from "@/lib/prisma";
import type { PlanType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paymongo-signature");

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.data?.attributes;

    // Only handle payment.paid events
    if (event?.type !== "payment.paid") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data?.attributes;
    const metadata = payment?.metadata;

    if (!metadata?.session_id || !metadata?.plan) {
      console.error("Missing metadata in webhook:", metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const sessionId = metadata.session_id as string;
    const plan = metadata.plan as PlanType;
    const amountInCentavos = payment.amount as number;
    const paymentReference = payment.id || payload.data?.id;

    // Validate amount matches plan
    if (!validatePaymentAmount(amountInCentavos, plan)) {
      console.error("Amount mismatch:", { amountInCentavos, plan });
      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // Idempotency check: skip if payment_reference already processed
    const existingEntitlement = await prisma.entitlement.findFirst({
      where: { paymentReference },
    });

    if (existingEntitlement) {
      // Already processed — idempotent success
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    // Activate or extend based on plan
    if (plan === "extend_149") {
      await extendEntitlement(sessionId, paymentReference);
    } else {
      await activateEntitlement(sessionId, plan, paymentReference);
    }

    // If bundle, create bundle_outputs placeholder
    if (plan === "bundle_999") {
      await prisma.bundleOutput.upsert({
        where: { sessionId },
        create: { sessionId },
        update: {},
      });
    }

    console.log(`Payment processed: ${plan} for session ${sessionId}`);
    return NextResponse.json({ received: true, status: "activated" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent PayMongo retries on known errors
    return NextResponse.json(
      { received: true, error: "Processing failed" },
      { status: 200 }
    );
  }
}
