import { prisma } from "@/lib/prisma";
import type { EntitlementInfo, PlanType } from "@/types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const TWENTY_ONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000;

export async function activateEntitlement(
  sessionId: string,
  plan: PlanType,
  paymentReference: string
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);

  await prisma.entitlement.upsert({
    where: { sessionId },
    create: {
      sessionId,
      plan,
      status: "active",
      activatedAt: now,
      expiresAt,
      paymentReference,
    },
    update: {
      plan,
      status: "active",
      activatedAt: now,
      expiresAt,
      paymentReference,
    },
  });
}

export async function extendEntitlement(
  sessionId: string,
  paymentReference: string
): Promise<void> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { sessionId },
  });

  if (!entitlement) {
    throw new Error("No entitlement found to extend");
  }

  if (entitlement.extensionsUsed >= 2) {
    throw new Error("Maximum extensions reached");
  }

  const now = new Date();
  let newExpiresAt: Date;

  if (entitlement.expiresAt && entitlement.expiresAt > now) {
    // Still active: extend from current expiry
    newExpiresAt = new Date(entitlement.expiresAt.getTime() + SEVEN_DAYS_MS);
  } else if (
    entitlement.expiresAt &&
    now.getTime() - entitlement.expiresAt.getTime() <= FORTY_EIGHT_HOURS_MS
  ) {
    // Within grace period: extend from now
    newExpiresAt = new Date(now.getTime() + SEVEN_DAYS_MS);
  } else {
    throw new Error("Entitlement expired beyond grace period");
  }

  // Use a separate update since paymentReference has a unique constraint
  // and we need to track this extension's payment separately
  await prisma.entitlement.update({
    where: { sessionId },
    data: {
      status: "active",
      expiresAt: newExpiresAt,
      extensionsUsed: entitlement.extensionsUsed + 1,
    },
  });
}

export async function getEntitlementInfo(
  sessionId: string
): Promise<EntitlementInfo> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { sessionId },
  });

  if (!entitlement || entitlement.status === "locked") {
    return {
      status: "locked",
      plan: entitlement?.plan || null,
      expiresAt: null,
      daysRemaining: null,
      hoursRemaining: null,
      showCountdown: false,
      isGracePeriod: false,
      extensionsUsed: entitlement?.extensionsUsed || 0,
    };
  }

  const now = new Date();
  const expiresAt = entitlement.expiresAt!;
  const msRemaining = expiresAt.getTime() - now.getTime();

  // Expired
  if (msRemaining <= 0) {
    const msOverdue = Math.abs(msRemaining);
    const isGracePeriod = msOverdue <= FORTY_EIGHT_HOURS_MS;

    return {
      status: isGracePeriod ? "active" : "expired",
      plan: entitlement.plan,
      expiresAt: expiresAt.toISOString(),
      daysRemaining: 0,
      hoursRemaining: 0,
      showCountdown: true,
      isGracePeriod,
      extensionsUsed: entitlement.extensionsUsed,
    };
  }

  // Active
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));
  const activatedAt = entitlement.activatedAt!;
  const msElapsed = now.getTime() - activatedAt.getTime();
  const showCountdown = msElapsed >= TWENTY_ONE_DAYS_MS;

  return {
    status: "active",
    plan: entitlement.plan,
    expiresAt: expiresAt.toISOString(),
    daysRemaining,
    hoursRemaining,
    showCountdown,
    isGracePeriod: false,
    extensionsUsed: entitlement.extensionsUsed,
  };
}
