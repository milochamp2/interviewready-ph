"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useLanguage } from "@/components/ui/Providers";

interface Props {
  sessionId: string;
}

export function ExpiredView({ sessionId }: Props) {
  const { t } = useLanguage();
  const { entitlement, loading } = useEntitlement(sessionId);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handlePurchase = async (plan: "extend_149" | "basic_399" | "bundle_999") => {
    setProcessingPlan(plan);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, plan }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin" />
      </main>
    );
  }

  const isGrace = entitlement?.isGracePeriod;
  const canExtend = (entitlement?.extensionsUsed || 0) < 2;

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[480px] mx-auto px-6 py-12 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-[rgba(255,77,106,0.15)] rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in-bounce">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 className="font-serif text-[28px] mb-2 animate-slide-up">
          {isGrace
            ? t("Your Access is Expiring", "Malapit Nang Ma-expire ang Access Mo")
            : t("Your Preparation Window Has Ended", "Natapos Na ang Preparation Window Mo")}
        </h2>

        <p className="text-[14px] text-[--text-secondary] mb-8 animate-slide-up delay-1">
          {isGrace
            ? t(
                "You're in a 48-hour grace period. Content is view-only — grading and PDF downloads are paused.",
                "Nasa 48-hour grace period ka. View-only ang content — naka-pause ang grading at PDF downloads."
              )
            : t(
                "Your 30-day access has expired. Renew or extend to continue practicing.",
                "Nag-expire na ang 30-araw mong access. Mag-renew o mag-extend para magpatuloy."
              )}
        </p>

        {/* Options */}
        <div className="space-y-3 animate-slide-up delay-2">
          {canExtend && (
            <Button
              size="lg"
              onClick={() => handlePurchase("extend_149")}
              loading={processingPlan === "extend_149"}
              className="w-full hover-scale"
            >
              {t("Extend 7 Days — ₱149", "I-extend ng 7 Araw — ₱149")}
            </Button>
          )}

          <Button
            size="lg"
            variant="secondary"
            onClick={() => handlePurchase("basic_399")}
            loading={processingPlan === "basic_399"}
            className="w-full hover-scale"
          >
            {t("Renew 30 Days — ₱399", "Mag-renew ng 30 Araw — ₱399")}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => handlePurchase("bundle_999")}
            loading={processingPlan === "bundle_999"}
            className="w-full hover-scale"
          >
            {t("Upgrade to Bundle — ₱999", "Mag-upgrade sa Bundle — ₱999")}
          </Button>
        </div>

        {!canExtend && (
          <p className="text-[12px] text-[--text-muted] mt-4 animate-fade-in delay-3">
            {t(
              "Maximum extensions reached (2). Please renew or upgrade.",
              "Naabot na ang maximum extensions (2). Mag-renew o mag-upgrade."
            )}
          </p>
        )}
      </div>
    </main>
  );
}
