"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [language] = useState<"en" | "tl">("en");

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (!isLastStep) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

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
      }
    } catch (err) {
      console.error("Session creation failed:", err);
    } finally {
      setLoading(false);
    }
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
        <div className="w-full max-w-[480px]">
          {/* Chat bubble question */}
          <div className="animate-slide-up mb-8">
            <div className="chat-bubble">
              <p className="text-[16px] leading-relaxed">{questionText}</p>
            </div>
          </div>

          {/* Options */}
          {step.type === "select" && (
            <div className="space-y-3 animate-slide-up delay-1">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left p-4 rounded-[12px] border transition-all duration-300 ${
                    answers[step.id] === option.value
                      ? "border-[--primary] bg-[rgba(255,109,63,0.1)] text-[--text-primary]"
                      : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--border-active] hover:bg-[--bg-elevated]"
                  }`}
                >
                  <span className="text-[14px] font-medium">
                    {language === "tl" ? option.labelTl : option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Textarea (job description) */}
          {step.type === "textarea" && (
            <div className="animate-slide-up delay-1">
              <textarea
                placeholder={
                  language === "tl"
                    ? "I-paste dito ang job description..."
                    : "Paste the job description here..."
                }
                rows={5}
                value={answers[step.id] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [step.id]: e.target.value })
                }
                maxLength={3000}
                className="mb-4 resize-none"
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleSubmit} loading={loading}>
                  Skip
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  className="flex-1"
                >
                  {language === "tl" ? "Ipagpatuloy" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Back button */}
          {currentStep > 0 && step.type === "select" && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="mt-6 text-[13px] text-[--text-muted] hover:text-[--text-secondary] transition-colors mx-auto block"
            >
              {language === "tl" ? "Bumalik" : "Go back"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
