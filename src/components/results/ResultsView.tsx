"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { TeaserPayload } from "@/types";

interface Props {
  sessionId: string;
}

export function ResultsView({ sessionId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teaser, setTeaser] = useState<TeaserPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generate() {
      try {
        const res = await fetch("/api/interview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (data.success) {
          setTeaser(data.data.teaser);
        } else {
          setError(data.error || "Failed to generate interview");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    generate();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-serif text-[24px] mb-2">Analyzing your profile...</h2>
          <p className="text-[14px] text-[--text-secondary]">
            Generating your personalized interview questions
          </p>
        </div>
      </main>
    );
  }

  if (error || !teaser) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-serif text-[24px] mb-2 text-[--danger]">
            Something went wrong
          </h2>
          <p className="text-[14px] text-[--text-secondary] mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </main>
    );
  }

  const score = teaser.readinessScore;
  const ringOffset = 314 - (314 * score) / 100;

  // Derive risks and wins from score
  const risks =
    score < 50
      ? [
          "You may struggle with unexpected questions",
          "Limited experience could be a challenge",
          "Interview anxiety might affect performance",
        ]
      : score < 75
      ? [
          "Some technical questions may catch you off guard",
          "Your answers could lack specific examples",
          "Time pressure might affect delivery",
        ]
      : [
          "Overconfidence could lead to vague answers",
          "Complex situational questions need preparation",
          "Industry-specific knowledge gaps possible",
        ];

  const wins =
    score < 50
      ? [
          "Practice builds confidence quickly",
          "Your eagerness to prepare is a strength",
          "Structured answers can compensate for experience",
        ]
      : score < 75
      ? [
          "Your experience provides good foundation",
          "You have relevant skills to highlight",
          "Preparation puts you ahead of most candidates",
        ]
      : [
          "Strong experience gives you an advantage",
          "Your confidence will show in interviews",
          "You have solid examples to draw from",
        ];

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[540px] mx-auto px-6 py-12">
        {/* Score ring */}
        <div className="text-center mb-10 animate-scale-in">
          <div className="score-ring mb-4 inline-flex">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="50" className="score-ring-track" />
              <circle
                cx="70"
                cy="70"
                r="50"
                className="score-ring-fill animate-ring-draw"
                style={{ "--ring-offset": ringOffset } as React.CSSProperties}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="score-ring-text gradient-text">{score}</span>
          </div>
          <h2 className="font-serif text-[28px] mb-2">Readiness Score</h2>
          <p className="text-[14px] text-[--text-secondary] leading-relaxed max-w-[380px] mx-auto">
            {teaser.readinessSummary}
          </p>
        </div>

        {/* Risks */}
        <div className="mb-6 animate-slide-up delay-1">
          <h3 className="font-serif text-[18px] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--danger]" />
            Key Risks
          </h3>
          <div className="space-y-2">
            {risks.map((risk, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-start gap-3"
              >
                <span className="text-[--danger] text-[14px] mt-0.5">!</span>
                <span className="text-[14px] text-[--text-secondary]">
                  {risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick wins */}
        <div className="mb-10 animate-slide-up delay-2">
          <h3 className="font-serif text-[18px] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--accent-teal]" />
            Quick Wins
          </h3>
          <div className="space-y-2">
            {wins.map((win, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-start gap-3"
              >
                <span className="text-[--accent-teal] text-[14px] mt-0.5">
                  +
                </span>
                <span className="text-[14px] text-[--text-secondary]">
                  {win}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-slide-up delay-3">
          <Button
            size="lg"
            onClick={() => router.push(`/m/${sessionId}`)}
            className="w-full"
          >
            Start Mock Interview
          </Button>
        </div>
      </div>
    </main>
  );
}
