"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";
import { useLanguage } from "@/components/ui/Providers";

const ROLES_EN = ["VA", "BPO", "CSR", "Marketing", "Web Dev"];
const ROLES_TL = ["VA", "BPO", "CSR", "Marketing", "Web Dev"];

export function LandingHero() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    trackEvent("ViewContent");
  }, []);

  // Rotating role text
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES_EN.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    trackEvent("StartQuestionnaire");
    router.push("/q");
  };

  const roles = language === "tl" ? ROLES_TL : ROLES_EN;

  return (
    <main className="pt-14 min-h-screen flex items-center justify-center relative">
      <div className="max-w-[620px] mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="animate-scale-in-bounce opacity-0 inline-flex items-center gap-2 glass-card-static px-5 py-2.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-[--accent-teal] animate-pulse" />
          <span className="text-[13px] text-[--text-secondary]">
            {t(
              "AI-powered interview prep for Filipino job seekers",
              "AI-powered interview prep para sa mga Pilipinong naghahanap ng trabaho"
            )}
          </span>
        </div>

        {/* Heading */}
        <h1 className="animate-slide-up opacity-0 delay-1 font-serif mb-6 tracking-tight leading-[1.1]">
          {t("Ace Your Next", "Ipasa ang Susunod Mong")}
          <br />
          <span className="gradient-text relative">
            <span
              key={roleIndex}
              className="inline-block animate-slide-up"
            >
              {roles[roleIndex]}
            </span>
          </span>{" "}
          {t("Interview", "Interview")}
        </h1>

        {/* Subheading */}
        <p className="animate-slide-up opacity-0 delay-2 text-[18px] text-[--text-secondary] mb-10 leading-relaxed max-w-[460px] mx-auto">
          {t(
            "Practice with AI-generated mock interviews tailored to VA, BPO, and CSR roles. Get scored, coached, and ready.",
            "Mag-practice gamit ang AI-generated mock interviews para sa VA, BPO, at CSR roles. Ma-score, ma-coach, at maging handa."
          )}
        </p>

        {/* CTA */}
        <div className="animate-slide-up opacity-0 delay-3">
          <Button
            size="lg"
            onClick={handleStart}
            className="animate-pulse-glow hover-scale"
          >
            {t("Start Practice", "Magsimula")}
          </Button>
          <p className="text-[13px] text-[--text-muted] mt-4">
            {t(
              "No sign-up needed. Takes 2 minutes.",
              "Walang sign-up. 2 minuto lang."
            )}
          </p>
        </div>

        {/* Trust badges */}
        <div className="animate-slide-up opacity-0 delay-5 mt-16 flex items-center justify-center gap-6 sm:gap-8">
          {[
            { value: "15", label: t("Practice Questions", "Practice Questions") },
            { value: "AI", label: t("Scoring & Feedback", "Scoring & Feedback") },
            { value: "PH", label: t("Focused Scenarios", "PH Scenarios") },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-8">
              {i > 0 && <div className="w-px h-8 bg-[--border]" />}
              <div className="text-center hover-scale cursor-default">
                <div className="text-[24px] font-bold gradient-text animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {badge.value}
                </div>
                <div className="text-[12px] text-[--text-muted]">
                  {badge.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
