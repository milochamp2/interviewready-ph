"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";
import { useLanguage } from "@/components/ui/Providers";

interface QuizStep {
  id: string;
  question: string;
  questionTl: string;
  options: { value: string; label: string; labelTl: string }[];
  type: "select" | "textarea";
}

const STEPS: QuizStep[] = [
  {
    id: "identityType",
    question: "Which best describes you?",
    questionTl: "Alin ang pinaka-angkop sa iyo?",
    type: "select",
    options: [
      { value: "fresh_grad", label: "Fresh graduate", labelTl: "Bagong graduate" },
      { value: "career_shifter", label: "Career shifter", labelTl: "Nagpapalit ng career" },
      { value: "employed_applying", label: "Employed but applying elsewhere", labelTl: "May trabaho pero nag-a-apply sa iba" },
      { value: "first_time", label: "First-time job seeker", labelTl: "Unang beses mag-apply" },
      { value: "experienced", label: "Experienced professional", labelTl: "May karanasan na" },
    ],
  },
  {
    id: "importanceLevel",
    question: "How important is getting this job to you?",
    questionTl: "Gaano kahalaga sa iyo na makuha itong trabaho?",
    type: "select",
    options: [
      { value: "exploring", label: "Just exploring", labelTl: "Nag-e-explore lang" },
      { value: "important", label: "It's important", labelTl: "Importante" },
      { value: "very_important", label: "Very important", labelTl: "Sobrang importante" },
      { value: "really_need", label: "I really need this job", labelTl: "Kailangan ko talaga 'to" },
    ],
  },
  {
    id: "worry",
    question: "What's your biggest worry about interviews?",
    questionTl: "Ano ang pinaka-kinakabahan mo sa interview?",
    type: "select",
    options: [
      { value: "freeze", label: "I might freeze up", labelTl: "Baka ma-blank ako" },
      { value: "unknown_questions", label: "Unexpected questions", labelTl: "Hindi inaasahang tanong" },
      { value: "english", label: "My English skills", labelTl: "English skills ko" },
      { value: "lack_experience", label: "Lack of experience", labelTl: "Kulang sa experience" },
      { value: "nervous", label: "General nervousness", labelTl: "Kinakabahan lang talaga" },
    ],
  },
  {
    id: "failedBefore",
    question: "Have you failed an interview before?",
    questionTl: "Na-fail mo na ba ang interview dati?",
    type: "select",
    options: [
      { value: "yes", label: "Yes", labelTl: "Oo" },
      { value: "no", label: "No", labelTl: "Hindi" },
      { value: "unsure", label: "Not sure why I was rejected", labelTl: "Hindi ko sure bakit na-reject" },
    ],
  },
  {
    id: "role",
    question: "What role are you applying for?",
    questionTl: "Anong role ang inaapplyan mo?",
    type: "select",
    options: [
      { value: "va", label: "Virtual Assistant", labelTl: "Virtual Assistant" },
      { value: "bpo_csr", label: "BPO / Customer Service", labelTl: "BPO / Customer Service" },
      { value: "smm", label: "Social Media Manager", labelTl: "Social Media Manager" },
      { value: "marketing", label: "Marketing", labelTl: "Marketing" },
      { value: "web_dev", label: "Web Developer", labelTl: "Web Developer" },
    ],
  },
  {
    id: "experienceLevel",
    question: "What's your experience level?",
    questionTl: "Gaano ka na katagal sa field na 'to?",
    type: "select",
    options: [
      { value: "fresh", label: "Fresh / No experience", labelTl: "Wala pa / Baguhan" },
      { value: "1_3", label: "1–3 years", labelTl: "1–3 taon" },
      { value: "3_plus", label: "3+ years", labelTl: "3+ taon" },
    ],
  },
  {
    id: "interviewTiming",
    question: "When is your interview?",
    questionTl: "Kailan ang interview mo?",
    type: "select",
    options: [
      { value: "within_3_days", label: "Within 3 days", labelTl: "Sa loob ng 3 araw" },
      { value: "this_week", label: "This week", labelTl: "Ngayong linggo" },
      { value: "just_preparing", label: "Just preparing ahead", labelTl: "Naghahanda lang" },
    ],
  },
  {
    id: "jobDescription",
    question: "Paste the job description (optional)",
    questionTl: "I-paste ang job description (opsyonal)",
    type: "textarea",
    options: [],
  },
];

export function QuizFlow() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setAnimKey((k) => k + 1);
      }, 300);
    }
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          identityType: answers.identityType,
          importanceLevel: answers.importanceLevel,
          worry: answers.worry,
          failedBefore: answers.failedBefore,
          role: answers.role,
          experienceLevel: answers.experienceLevel,
          interviewTiming: answers.interviewTiming,
          jobDescription: answers.jobDescription || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        trackEvent("Lead");
        router.push(`/r/${data.data.sessionId}`);
      } else {
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.";
        setError(errMsg);
      }
    } catch {
      setError(
        t(
          "Something went wrong. Please try again.",
          "May nangyaring mali. Subukan ulit."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [answers, language, router, t]);

  const goBack = () => {
    setCurrentStep((s) => s - 1);
    setAnimKey((k) => k + 1);
  };

  const questionText = language === "tl" ? step.questionTl : step.question;

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="progress-bar mx-6 mt-6">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-center text-[12px] text-[--text-muted] mt-2">
        {currentStep + 1} / {STEPS.length}
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[480px]" key={animKey}>
          {/* Chat bubble */}
          <div className="animate-slide-in-left mb-8">
            <div className="chat-bubble">
              <p className="text-[16px] leading-relaxed font-medium">
                {questionText}
              </p>
            </div>
          </div>

          {/* Select options */}
          {step.type === "select" && (
            <div className="space-y-3">
              {step.options.map((option, i) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`option-card w-full text-left animate-slide-up opacity-0 ${
                    answers[step.id] === option.value ? "selected" : ""
                  }`}
                  style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                >
                  <span className="relative z-10 text-[14px] font-medium text-[--text-secondary]">
                    {language === "tl" ? option.labelTl : option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Textarea (job description) */}
          {step.type === "textarea" && (
            <div className="animate-slide-up opacity-0 delay-1">
              <textarea
                placeholder={t(
                  "Paste the job description here...",
                  "I-paste dito ang job description..."
                )}
                rows={5}
                value={answers[step.id] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [step.id]: e.target.value })
                }
                maxLength={3000}
                className="mb-4 resize-none"
              />

              {error && (
                <div className="text-[13px] text-[--danger] mb-3 glass-card-static p-3 animate-scale-in-bounce">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  {t("Skip", "Laktawan")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  className="flex-1"
                >
                  {t("Continue", "Ipagpatuloy")}
                </Button>
              </div>
            </div>
          )}

          {/* Back button */}
          {currentStep > 0 && step.type === "select" && (
            <button
              onClick={goBack}
              className="mt-6 text-[13px] text-[--text-muted] hover:text-[--text-secondary] transition-colors mx-auto block hover-scale"
            >
              {t("Go back", "Bumalik")}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
