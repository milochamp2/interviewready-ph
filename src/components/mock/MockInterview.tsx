"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";
import type { TeaserPayload } from "@/types";

interface Props {
  sessionId: string;
}

export function MockInterview({ sessionId }: Props) {
  const router = useRouter();
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
        <div className="w-12 h-12 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin" />
      </main>
    );
  }

  if (!teaser) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <p className="text-[--text-secondary]">Failed to load interview.</p>
      </main>
    );
  }

  const question = teaser.questions[currentQ];

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[540px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <span className="inline-block bg-[--bg-card] border border-[--border] rounded-full px-3 py-1 text-[12px] text-[--text-muted] mb-3">
            Free Preview — {currentQ + 1} of {teaser.questions.length}
          </span>
          <h2 className="font-serif text-[28px]">Mock Interview</h2>
        </div>

        {/* Question card */}
        <div className="glass-card p-6 mb-4 animate-slide-up delay-1">
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
            className="mb-6"
          >
            Show Sample Answer
          </Button>
        ) : (
          <div className="glass-card-elevated p-5 mb-6 animate-fade-in">
            <div className="text-[12px] font-semibold text-[--accent-teal] uppercase tracking-wide mb-2">
              Strong Sample Answer
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
              Previous
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
              Next Question
            </Button>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Paywall */}
        <div className="glass-card p-6 text-center animate-slide-up delay-2 border-[--primary] border-opacity-30">
          <div className="w-12 h-12 bg-[--primary-glow] rounded-full flex items-center justify-center mx-auto mb-4">
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
            Unlock Full Interview
          </h3>
          <p className="text-[14px] text-[--text-secondary] mb-1">
            Get all 15 questions with AI scoring and detailed feedback
          </p>
          <p className="text-[13px] text-[--text-muted] mb-6">
            {teaser.feedbackSummary}
          </p>
          <Button size="lg" onClick={handleCheckout} className="w-full mb-3">
            Continue to Secure Checkout — ₱399
          </Button>
          <p className="text-[12px] text-[--text-muted]">
            Upgrade available at checkout
          </p>
        </div>
      </div>
    </main>
  );
}
