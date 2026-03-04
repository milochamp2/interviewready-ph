import crypto from "crypto";
import type { PlanType } from "@/types";

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY!;
const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Amounts in centavos (PayMongo uses centavos)
const PLAN_AMOUNTS: Record<PlanType, number> = {
  basic_399: 39900,
  bundle_999: 99900,
  extend_149: 14900,
};

const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  basic_399: "InterviewReady PH — Full Interview Unlock (₱399)",
  bundle_999: "InterviewReady PH — Complete Career Bundle (₱999)",
  extend_149: "InterviewReady PH — 7-Day Extension (₱149)",
};

export async function createCheckoutSession(
  sessionId: string,
  plan: PlanType
): Promise<string> {
  const amount = PLAN_AMOUNTS[plan];
  const description = PLAN_DESCRIPTIONS[plan];

  const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description,
          line_items: [
            {
              currency: "PHP",
              amount,
              name: description,
              quantity: 1,
            },
          ],
          payment_method_types: [
            "gcash",
            "grab_pay",
            "paymaya",
            "card",
          ],
          success_url: `${APP_URL}/success?session_id=${sessionId}`,
          cancel_url: `${APP_URL}/checkout/${sessionId}`,
          metadata: {
            session_id: sessionId,
            plan,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayMongo checkout error:", error);
    throw new Error("Failed to create PayMongo checkout session");
  }

  const data = await response.json();
  return data.data.attributes.checkout_url;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  try {
    // PayMongo signature format: t=timestamp,te=test_signature,li=live_signature
    const parts = signatureHeader.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const testSig = parts.find((p) => p.startsWith("te="))?.slice(3);
    const liveSig = parts.find((p) => p.startsWith("li="))?.slice(3);

    if (!timestamp) return false;

    const signature = liveSig || testSig;
    if (!signature) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", PAYMONGO_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export function validatePaymentAmount(
  amountInCentavos: number,
  plan: PlanType
): boolean {
  const expected = PLAN_AMOUNTS[plan];
  return amountInCentavos === expected;
}
