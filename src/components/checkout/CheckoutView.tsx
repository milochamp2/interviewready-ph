"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";

interface Props {
  sessionId: string;
}

const FEATURES = [
  { name: "Full 15-question mock", basic: true, bundle: true },
  { name: "AI scoring per answer", basic: true, bundle: true },
  { name: "Download prep PDF", basic: true, bundle: true },
  { name: "Resume optimization", basic: false, bundle: true },
  { name: "Cover letter", basic: false, bundle: true },
  { name: "7-day practice mode", basic: false, bundle: true },
];

export function CheckoutView({ sessionId }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"basic_399" | "bundle_999">(
    "basic_399"
  );
  const [loading, setLoading] = useState(false);

  const handlePlanChange = (plan: "basic_399" | "bundle_999") => {
    setSelectedPlan(plan);
    if (plan === "bundle_999") {
      trackEvent("AddToCart", { value: 999, currency: "PHP" });
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    trackEvent("InitiateCheckout", {
      value: selectedPlan === "basic_399" ? 399 : 999,
      currency: "PHP",
    });

    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, plan: selectedPlan }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-[540px] mx-auto px-6 py-12">
        <h2 className="font-serif text-[30px] text-center mb-8 tracking-tight">
          Choose Your Plan
        </h2>

        {/* Plan cards */}
        <div
          onClick={() => handlePlanChange("basic_399")}
          className={`bg-[--bg-card] border-2 rounded-[16px] p-6 cursor-pointer transition-all duration-300 mb-3 relative ${
            selectedPlan === "basic_399"
              ? "border-[--primary] shadow-[0_0_0_3px_var(--primary-glow)]"
              : "border-[--border] hover:border-[--border-active]"
          }`}
        >
          <div
            className={`absolute top-6 right-6 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
              selectedPlan === "basic_399"
                ? "border-[--primary] bg-[--primary]"
                : "border-[--text-muted]"
            }`}
          >
            {selectedPlan === "basic_399" && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="font-bold text-[16px] mb-1">Full Interview Unlock</div>
          <div className="text-[32px] font-black">
            <span className="text-lg font-semibold text-[--text-secondary] align-top mr-0.5">
              ₱
            </span>
            399
            <span className="text-sm font-medium text-[--text-muted] ml-1">
              one-time
            </span>
          </div>
          <div className="text-sm text-[--text-muted] mt-2 leading-relaxed">
            15 role-specific questions, AI scoring, sample answers, and
            downloadable PDF. 30-day access.
          </div>
        </div>

        <div
          onClick={() => handlePlanChange("bundle_999")}
          className={`bg-[--bg-card] border-2 rounded-[16px] p-6 cursor-pointer transition-all duration-300 mb-8 relative ${
            selectedPlan === "bundle_999"
              ? "border-[--primary] shadow-[0_0_0_3px_var(--primary-glow)]"
              : "border-[--border] hover:border-[--border-active]"
          }`}
        >
          <div className="absolute -top-3 left-6 bg-[--accent-teal] text-[--bg-base] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Best Value
          </div>
          <div
            className={`absolute top-6 right-6 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
              selectedPlan === "bundle_999"
                ? "border-[--primary] bg-[--primary]"
                : "border-[--text-muted]"
            }`}
          >
            {selectedPlan === "bundle_999" && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="font-bold text-[16px] mb-1">
            Complete Career Bundle
          </div>
          <div className="text-[32px] font-black">
            <span className="text-lg font-semibold text-[--text-secondary] align-top mr-0.5">
              ₱
            </span>
            999
            <span className="text-sm font-medium text-[--text-muted] ml-1">
              one-time
            </span>
          </div>
          <div className="text-sm text-[--text-muted] mt-2 leading-relaxed">
            Everything in Full Unlock + resume optimization, cover letter, and
            7-day practice mode.
          </div>
        </div>

        {/* Comparison table */}
        <div className="glass-card overflow-hidden mb-8">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[--border]">
                <th className="text-left p-4 text-[--text-muted] font-medium">
                  Feature
                </th>
                <th className="p-4 text-center text-[--text-muted] font-medium">
                  ₱399
                </th>
                <th className="p-4 text-center text-[--text-muted] font-medium">
                  ₱999
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr
                  key={i}
                  className={
                    i < FEATURES.length - 1 ? "border-b border-[--border]" : ""
                  }
                >
                  <td className="p-4 text-[--text-secondary]">
                    {feature.name}
                  </td>
                  <td className="p-4 text-center">
                    {feature.basic ? (
                      <span className="text-[--accent-teal]">&#10003;</span>
                    ) : (
                      <span className="text-[--text-muted]">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.bundle ? (
                      <span className="text-[--accent-teal]">&#10003;</span>
                    ) : (
                      <span className="text-[--text-muted]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment info */}
        <p className="text-[13px] text-[--text-muted] text-center mb-4">
          Pay securely via GCash, Maya, or Cards (PayMongo)
        </p>

        <Button
          size="lg"
          onClick={handleCheckout}
          loading={loading}
          className="w-full"
        >
          Proceed to PayMongo Checkout
        </Button>
      </div>
    </main>
  );
}
