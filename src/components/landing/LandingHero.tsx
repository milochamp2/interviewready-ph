"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/components/ui/MetaPixel";

export function LandingHero() {
  const router = useRouter();

  useEffect(() => {
    trackEvent("ViewContent");
  }, []);

  const handleStart = () => {
    trackEvent("StartQuestionnaire");
    router.push("/q");
  };

  return (
    <main className="pt-14 min-h-screen flex items-center justify-center">
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="animate-slide-up opacity-0 inline-flex items-center gap-2 bg-[--bg-card] border border-[--border] rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[--accent-teal] animate-pulse" />
          <span className="text-[13px] text-[--text-secondary]">
            AI-powered interview prep for Filipino job seekers
          </span>
        </div>

        {/* Heading */}
        <h1 className="animate-slide-up opacity-0 delay-1 font-serif mb-6 tracking-tight leading-[1.1]">
          Ace Your Next
          <br />
          <span className="gradient-text">Interview</span>
        </h1>

        {/* Subheading */}
        <p className="animate-slide-up opacity-0 delay-2 text-[18px] text-[--text-secondary] mb-10 leading-relaxed max-w-[440px] mx-auto">
          Practice with AI-generated mock interviews tailored to VA, BPO, and
          CSR roles. Get scored, coached, and ready.
        </p>

        {/* CTA */}
        <div className="animate-slide-up opacity-0 delay-3">
          <Button size="lg" onClick={handleStart} className="animate-pulse-glow">
            Start Practice
          </Button>
          <p className="text-[13px] text-[--text-muted] mt-4">
            No sign-up needed. Takes 2 minutes.
          </p>
        </div>

        {/* Trust badges */}
        <div className="animate-slide-up opacity-0 delay-4 mt-16 flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-[24px] font-bold gradient-text">15</div>
            <div className="text-[12px] text-[--text-muted]">
              Practice Questions
            </div>
          </div>
          <div className="w-px h-8 bg-[--border]" />
          <div className="text-center">
            <div className="text-[24px] font-bold gradient-text">AI</div>
            <div className="text-[12px] text-[--text-muted]">
              Scoring & Feedback
            </div>
          </div>
          <div className="w-px h-8 bg-[--border]" />
          <div className="text-center">
            <div className="text-[24px] font-bold gradient-text">PH</div>
            <div className="text-[12px] text-[--text-muted]">
              Focused Scenarios
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
