"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useEntitlement } from "@/hooks/useEntitlement";
import { trackEvent } from "@/components/ui/MetaPixel";
import { useLanguage } from "@/components/ui/Providers";
import type { FullInterviewPayload, GradeResult } from "@/types";

interface Props {
  sessionId: string;
}

function ConfettiEffect() {
  const pieces = useMemo(() => {
    const colors = ["#FF6D3F", "#2DD4A8", "#4D8EFF", "#FFB547", "#FF4D6A"];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      size: `${6 + Math.random() * 6}px`,
    }));
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            background: p.color,
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

export function SuccessView({ sessionId }: Props) {
  const { t } = useLanguage();
  const { entitlement, loading: entLoading } = useEntitlement(sessionId);
  const [interview, setInterview] = useState<FullInterviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [purchaseTracked, setPurchaseTracked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (entitlement?.status === "active" && !purchaseTracked) {
      trackEvent("Purchase", {
        value: entitlement.plan === "bundle_999" ? 999 : 399,
        currency: "PHP",
      });
      setPurchaseTracked(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [entitlement, purchaseTracked]);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const res = await fetch(`/api/pdf?session_id=${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setInterview(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch interview:", err);
      } finally {
        setLoading(false);
      }
    }

    if (entitlement?.status === "active") {
      fetchInterview();
    }
  }, [sessionId, entitlement]);

  const handleGrade = async () => {
    if (!interview || !userAnswer.trim()) return;
    setGrading(true);
    setGradeResult(null);

    try {
      const res = await fetch("/api/interview/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: interview.questions[currentQ].id,
          userAnswer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGradeResult(data.data);
      }
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setGrading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;
    try {
      await fetch("/api/email/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email }),
      });
      setEmailSent(true);
    } catch (err) {
      console.error("Email send failed:", err);
    }
  };

  if (entLoading || loading) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-serif text-[24px] mb-2 animate-slide-up">
            {t("Loading your content...", "Nilo-load ang content mo...")}
          </h2>
          <p className="text-[14px] text-[--text-secondary]">
            {t("Verifying your payment", "Vine-verify ang bayad mo")}
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

  if (!entitlement || entitlement.status !== "active") {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6 glass-card p-8 animate-scale-in">
          <div className="w-12 h-12 border-4 border-[--bg-elevated] border-t-[--primary] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-serif text-[24px] mb-2">
            {t("Payment Pending", "Hinihintay ang Bayad")}
          </h2>
          <p className="text-[14px] text-[--text-secondary] mb-6">
            {t(
              "Your payment is being verified. This page will update automatically.",
              "Vine-verify ang bayad mo. Mag-a-update ang page na ito."
            )}
          </p>
        </div>
      </main>
    );
  }

  if (!interview) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <p className="text-[--text-secondary]">
          {t("Interview data not available.", "Hindi available ang interview data.")}
        </p>
      </main>
    );
  }

  const question = interview.questions[currentQ];

  return (
    <main className="pt-14 min-h-screen">
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-[600px] mx-auto px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-10 animate-scale-in-bounce">
          <div className="w-16 h-16 bg-[rgba(45,212,168,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="font-serif text-[28px] mb-2">
            {t("Content Unlocked!", "Na-unlock na ang Content!")}
          </h2>
          <p className="text-[14px] text-[--text-secondary]">
            {t(
              `You have access to all ${interview.questions.length} questions with AI scoring`,
              `May access ka na sa lahat ng ${interview.questions.length} questions na may AI scoring`
            )}
          </p>
          {entitlement.showCountdown && (
            <div className="mt-3 text-[13px] text-[--warning] glass-card-static inline-block px-3 py-1">
              {entitlement.daysRemaining! > 3
                ? `${entitlement.daysRemaining} ${t("days remaining", "araw na lang")}`
                : `${entitlement.hoursRemaining} ${t("hours remaining", "oras na lang")}`}
            </div>
          )}
        </div>

        {/* Question navigation */}
        <div className="flex flex-wrap gap-2 mb-6 animate-slide-up delay-1">
          {interview.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQ(i);
                setUserAnswer("");
                setGradeResult(null);
              }}
              className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all hover-scale ${
                i === currentQ
                  ? "bg-gradient-to-r from-[#FF6D3F] to-[#FF9040] text-white shadow-md"
                  : "glass-card-static text-[--text-muted] hover:border-[--border-active]"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
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
              Q{currentQ + 1} {t("of", "sa")} {interview.questions.length}
            </span>
          </div>
          <p className="text-[16px] leading-relaxed">{question.questionText}</p>
        </div>

        {/* User answer input */}
        {!entitlement.isGracePeriod && (
          <div className="mb-4 animate-fade-in">
            <textarea
              placeholder={t("Type your answer here...", "I-type ang sagot mo dito...")}
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="resize-none mb-3"
            />
            <Button
              onClick={handleGrade}
              loading={grading}
              disabled={userAnswer.length < 10}
              className="w-full"
            >
              {t("Grade My Answer", "I-grade ang Sagot Ko")}
            </Button>
          </div>
        )}

        {/* Grade result */}
        {gradeResult && (
          <div className="glass-card-elevated p-6 mb-4 animate-scale-in-bounce">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-semibold">
                {t("Your Score", "Score Mo")}
              </span>
              <span
                className={`text-[28px] font-black ${
                  gradeResult.score >= 7
                    ? "text-[--accent-teal]"
                    : gradeResult.score >= 5
                    ? "text-[--warning]"
                    : "text-[--danger]"
                }`}
              >
                {gradeResult.score}/10
              </span>
            </div>
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-[--accent-teal] uppercase tracking-wide mb-1">
                {t("Strengths", "Mga Kalakasan")}
              </div>
              <ul className="text-[13px] text-[--text-secondary] space-y-1">
                {gradeResult.strengths.map((s, i) => (
                  <li key={i}>+ {s}</li>
                ))}
              </ul>
            </div>
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-[--danger] uppercase tracking-wide mb-1">
                {t("Areas to Improve", "Mga Dapat Pagbutihin")}
              </div>
              <ul className="text-[13px] text-[--text-secondary] space-y-1">
                {gradeResult.weaknesses.map((w, i) => (
                  <li key={i}>- {w}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-[--accent-blue] uppercase tracking-wide mb-1">
                {t("Improved Answer", "Pinahusay na Sagot")}
              </div>
              <p className="text-[13px] text-[--text-secondary] leading-relaxed">
                {gradeResult.improvedAnswer}
              </p>
            </div>
          </div>
        )}

        {/* Sample answer */}
        <div className="glass-card p-5 mb-8">
          <div className="text-[12px] font-semibold text-[--accent-teal] uppercase tracking-wide mb-2">
            {t("Strong Sample Answer", "Magandang Sample Answer")}
          </div>
          <p className="text-[14px] text-[--text-secondary] leading-relaxed">
            {question.sampleAnswer}
          </p>
        </div>

        {/* PDF + Email section */}
        <div className="glass-card p-6 mb-6 animate-slide-up delay-2">
          <h3 className="font-serif text-[18px] mb-4">
            {t("Download & Share", "I-download at I-share")}
          </h3>
          <a
            href={`/api/pdf?session_id=${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-full mb-4 hover-scale">
              {t("Download Prep PDF", "I-download ang Prep PDF")}
            </Button>
          </a>

          {!emailSent ? (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleSendEmail}>
                {t("Send", "Ipadala")}
              </Button>
            </div>
          ) : (
            <p className="text-[13px] text-[--accent-teal] text-center animate-scale-in-bounce">
              {t("PDF sent to your email!", "Naipadala na ang PDF sa email mo!")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
