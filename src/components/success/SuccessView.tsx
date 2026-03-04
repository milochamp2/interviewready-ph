"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useEntitlement } from "@/hooks/useEntitlement";
import { trackEvent } from "@/components/ui/MetaPixel";
import type { FullInterviewPayload, GradeResult } from "@/types";

interface Props {
  sessionId: string;
}

export function SuccessView({ sessionId }: Props) {
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

  useEffect(() => {
    if (entitlement?.status === "active" && !purchaseTracked) {
      trackEvent("Purchase", {
        value: entitlement.plan === "bundle_999" ? 999 : 399,
        currency: "PHP",
      });
      setPurchaseTracked(true);
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
          <h2 className="font-serif text-[24px] mb-2">Loading your content...</h2>
          <p className="text-[14px] text-[--text-secondary]">
            Verifying your payment
          </p>
        </div>
      </main>
    );
  }

  if (!entitlement || entitlement.status !== "active") {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-serif text-[24px] mb-2">Payment Pending</h2>
          <p className="text-[14px] text-[--text-secondary] mb-6">
            Your payment is being verified. This page will update automatically.
          </p>
        </div>
      </main>
    );
  }

  if (!interview) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <p className="text-[--text-secondary]">
          Interview data not available.
        </p>
      </main>
    );
  }

  const question = interview.questions[currentQ];

  return (
    <main className="pt-14 min-h-screen">
      <div className="max-w-[600px] mx-auto px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-10 animate-scale-in">
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
          <h2 className="font-serif text-[28px] mb-2">Content Unlocked!</h2>
          <p className="text-[14px] text-[--text-secondary]">
            You have access to all {interview.questions.length} questions with
            AI scoring
          </p>
          {entitlement.showCountdown && (
            <div className="mt-3 text-[13px] text-[--warning]">
              {entitlement.daysRemaining! > 3
                ? `${entitlement.daysRemaining} days remaining`
                : `${entitlement.hoursRemaining} hours remaining`}
            </div>
          )}
        </div>

        {/* Question navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {interview.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQ(i);
                setUserAnswer("");
                setGradeResult(null);
              }}
              className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all ${
                i === currentQ
                  ? "bg-[--primary] text-white"
                  : "bg-[--bg-card] border border-[--border] text-[--text-muted] hover:border-[--border-active]"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        <div className="glass-card p-6 mb-4">
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
              Q{currentQ + 1} of {interview.questions.length}
            </span>
          </div>
          <p className="text-[16px] leading-relaxed">{question.questionText}</p>
        </div>

        {/* User answer */}
        {!entitlement.isGracePeriod && (
          <div className="mb-4">
            <textarea
              placeholder="Type your answer here..."
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
              Grade My Answer
            </Button>
          </div>
        )}

        {/* Grade result */}
        {gradeResult && (
          <div className="glass-card-elevated p-6 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-semibold">Your Score</span>
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
                Strengths
              </div>
              <ul className="text-[13px] text-[--text-secondary] space-y-1">
                {gradeResult.strengths.map((s, i) => (
                  <li key={i}>+ {s}</li>
                ))}
              </ul>
            </div>
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-[--danger] uppercase tracking-wide mb-1">
                Areas to Improve
              </div>
              <ul className="text-[13px] text-[--text-secondary] space-y-1">
                {gradeResult.weaknesses.map((w, i) => (
                  <li key={i}>- {w}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-[--accent-blue] uppercase tracking-wide mb-1">
                Improved Answer
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
            Strong Sample Answer
          </div>
          <p className="text-[14px] text-[--text-secondary] leading-relaxed">
            {question.sampleAnswer}
          </p>
        </div>

        {/* PDF + Email section */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-serif text-[18px] mb-4">Download & Share</h3>
          <a
            href={`/api/pdf?session_id=${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-full mb-4">
              Download Prep PDF
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
                Send
              </Button>
            </div>
          ) : (
            <p className="text-[13px] text-[--accent-teal] text-center">
              PDF sent to your email!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
