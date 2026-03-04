"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";
import { useLanguage } from "@/components/ui/Providers";
import type { TeaserPayload } from "@/types";

interface Props {
  sessionId: string;
}

export function MockInterview({ sessionId }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [teaser, setTeaser] = useState<TeaserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    async function fetchTeaser() {
      try {
        const res = await fetch("/api/interview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          setTeaser(data.data.teaser);
        }
      } catch (err) {
        console.error("Failed to fetch teaser:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeaser();
  }, [sessionId]);

  const handleCheckout = () => {
    trackEvent("InitiateCheckout", { value: 399, currency: "PHP" });
    router.push(`/checkout/${sessionId}`);
  };

  if (loading) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin mx-auto" />
          <div className="flex justify-center gap-2 mt-4">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </main>
    );
  }

  if (!teaser) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <p className="text-[--text-secondary]">
          {t("Failed to load interview.", "Hindi na-load ang interview.")}
        </p>
      </main>
    );
  }

  const question = teaser.questions[currentQ];

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[540px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <span className="inline-block glass-card-static px-4 py-1.5 text-[12px] text-[--text-muted] mb-3">
            {t("Free Preview", "Libreng Preview")} — {currentQ + 1}{" "}
            {t("of", "sa")} {teaser.questions.length}
          </span>
          <h2 className="font-serif text-[28px]">
            {t("Mock Interview", "Mock Interview")}
          </h2>
        </div>

        {/* Question card */}
        <div className="glass-card p-6 mb-4 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                question.category === "behavioral"
                  ? "bg-[rgba(77,142,255,0.15)] text-[--accent-blue]"
                  : question.category === "situational"
                  ? "bg-[rgba(255,181,71,0.15)] text-[--warning]"
                  : "bg-[rgba(45,212,168,0.15)] text-[--accent-teal]"
              }`}
            >
              {question.category}
            </span>
            <span className="text-[12px] text-[--text-muted]">
              Q{currentQ + 1}
            </span>
          </div>
          <p className="text-[16px] leading-relaxed">{question.questionText}</p>
        </div>

        {/* Show/hide answer */}
        {!showAnswer ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAnswer(true)}
            className="mb-6 hover-scale"
          >
            {t("Show Sample Answer", "Ipakita ang Sample Answer")}
          </Button>
        ) : (
          <div className="glass-card-elevated p-5 mb-6 animate-slide-up">
            <div className="text-[12px] font-semibold text-[--accent-teal] uppercase tracking-wide mb-2">
              {t("Strong Sample Answer", "Magandang Sample Answer")}
            </div>
            <p className="text-[14px] text-[--text-secondary] leading-relaxed">
              {question.sampleAnswer}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mb-10">
          {currentQ > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentQ((q) => q - 1);
                setShowAnswer(false);
              }}
            >
              {t("Previous", "Nakaraan")}
            </Button>
          )}
          {currentQ < teaser.questions.length - 1 ? (
            <Button
              className="flex-1"
              onClick={() => {
                setCurrentQ((q) => q + 1);
                setShowAnswer(false);
              }}
            >
              {t("Next Question", "Susunod na Tanong")}
            </Button>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Paywall */}
        <div className="glass-card p-6 text-center animate-slide-up animate-border-glow">
          <div className="w-12 h-12 bg-[--primary-glow] rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="font-serif text-[20px] mb-2">
            {t("Unlock Full Interview", "I-unlock ang Full Interview")}
          </h3>
          <p className="text-[14px] text-[--text-secondary] mb-1">
            {t(
              "Get all 15 questions with AI scoring and detailed feedback",
              "Makuha ang lahat ng 15 questions na may AI scoring at detailed feedback"
            )}
          </p>
          <p className="text-[13px] text-[--text-muted] mb-6">
            {teaser.feedbackSummary}
          </p>
          <Button
            size="lg"
            onClick={handleCheckout}
            className="w-full mb-3 animate-pulse-glow"
          >
            {t("Continue to Secure Checkout — ₱399", "Magpatuloy sa Secure Checkout — ₱399")}
          </Button>
          <p className="text-[12px] text-[--text-muted]">
            {t("Upgrade available at checkout", "May upgrade sa checkout")}
          </p>
        </div>
      </div>
    </main>
  );
}
