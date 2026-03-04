"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/ui/Providers";
import type { TeaserPayload } from "@/types";

interface Props {
  sessionId: string;
}

export function ResultsView({ sessionId }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
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
          <h2 className="font-serif text-[24px] mb-2 animate-slide-up">
            {t("Analyzing your profile...", "Sinusuri ang profile mo...")}
          </h2>
          <p className="text-[14px] text-[--text-secondary] animate-fade-in delay-2">
            {t(
              "Generating your personalized interview questions",
              "Gumagawa ng personalized interview questions"
            )}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !teaser) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6 glass-card p-8 animate-scale-in">
          <h2 className="font-serif text-[24px] mb-2 text-[--danger]">
            {t("Something went wrong", "May nangyaring mali")}
          </h2>
          <p className="text-[14px] text-[--text-secondary] mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t("Try Again", "Subukan Ulit")}
          </Button>
        </div>
      </main>
    );
  }

  const score = teaser.readinessScore;
  const ringOffset = 314 - (314 * score) / 100;

  const risks =
    score < 50
      ? [
          t("You may struggle with unexpected questions", "Baka mahirapan ka sa mga hindi inaasahang tanong"),
          t("Limited experience could be a challenge", "Ang limitadong experience ay maaaring maging hamon"),
          t("Interview anxiety might affect performance", "Ang interview anxiety ay maaaring makaapekto"),
        ]
      : score < 75
      ? [
          t("Some technical questions may catch you off guard", "Ang ilang technical questions ay baka hindi mo inaasahan"),
          t("Your answers could lack specific examples", "Ang mga sagot mo ay baka kulang sa mga specific na halimbawa"),
          t("Time pressure might affect delivery", "Ang time pressure ay maaaring makaapekto sa delivery"),
        ]
      : [
          t("Overconfidence could lead to vague answers", "Ang labis na kumpiyansa ay maaaring humantong sa malabong sagot"),
          t("Complex situational questions need preparation", "Ang kumplikadong situational questions ay kailangan ng paghahanda"),
          t("Industry-specific knowledge gaps possible", "Posibleng may gaps sa industry-specific knowledge"),
        ];

  const wins =
    score < 50
      ? [
          t("Practice builds confidence quickly", "Ang practice ay mabilis na nagbuo ng kumpiyansa"),
          t("Your eagerness to prepare is a strength", "Ang iyong pagnanais na maghanda ay isang kalakasan"),
          t("Structured answers can compensate for experience", "Ang structured na sagot ay makakatulong kahit kulang sa experience"),
        ]
      : score < 75
      ? [
          t("Your experience provides good foundation", "Ang iyong experience ay nagbibigay ng matibay na pundasyon"),
          t("You have relevant skills to highlight", "May relevant skills ka na pwedeng i-highlight"),
          t("Preparation puts you ahead of most candidates", "Ang paghahanda ay naglalagay sa iyo sa unahan"),
        ]
      : [
          t("Strong experience gives you an advantage", "Ang matibay na experience ay nagbibigay sa iyo ng advantage"),
          t("Your confidence will show in interviews", "Makikita ang iyong kumpiyansa sa interview"),
          t("You have solid examples to draw from", "May matibay kang mga halimbawang magagamit"),
        ];

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[540px] mx-auto px-6 py-12">
        {/* Score ring */}
        <div className="text-center mb-10 animate-scale-in-bounce">
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
          <h2 className="font-serif text-[28px] mb-2">
            {t("Readiness Score", "Readiness Score")}
          </h2>
          <p className="text-[14px] text-[--text-secondary] leading-relaxed max-w-[380px] mx-auto">
            {teaser.readinessSummary}
          </p>
        </div>

        {/* Risks */}
        <div className="mb-6 animate-slide-up delay-2">
          <h3 className="font-serif text-[18px] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--danger]" />
            {t("Key Risks", "Mga Panganib")}
          </h3>
          <div className="space-y-2">
            {risks.map((risk, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-start gap-3 animate-slide-in-left opacity-0"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <span className="text-[--danger] text-[14px] mt-0.5 flex-shrink-0">!</span>
                <span className="text-[14px] text-[--text-secondary]">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick wins */}
        <div className="mb-10 animate-slide-up delay-3">
          <h3 className="font-serif text-[18px] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--accent-teal]" />
            {t("Quick Wins", "Mabilisang Panalo")}
          </h3>
          <div className="space-y-2">
            {wins.map((win, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-start gap-3 animate-slide-in-right opacity-0"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <span className="text-[--accent-teal] text-[14px] mt-0.5 flex-shrink-0">+</span>
                <span className="text-[14px] text-[--text-secondary]">{win}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-slide-up delay-5">
          <Button
            size="lg"
            onClick={() => router.push(`/m/${sessionId}`)}
            className="w-full animate-pulse-glow"
          >
            {t("Start Mock Interview", "Simulan ang Mock Interview")}
          </Button>
        </div>
      </div>
    </main>
  );
}
