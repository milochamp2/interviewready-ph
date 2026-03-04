"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [language, setLanguage] = useState<"en" | "tl">("en");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[--bg-base]/80 backdrop-blur-lg border-b border-[--border]">
      <div className="max-w-[--container-max] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-[18px] font-bold text-[--text-primary]">
            Interview<span className="gradient-text">Ready</span>
          </span>
          <span className="text-[11px] font-medium text-[--text-muted] bg-[--bg-card] px-2 py-0.5 rounded-full">
            PH
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              language === "en"
                ? "bg-[--primary] text-white"
                : "text-[--text-muted] hover:text-[--text-secondary]"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("tl")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              language === "tl"
                ? "bg-[--primary] text-white"
                : "text-[--text-muted] hover:text-[--text-secondary]"
            }`}
          >
            TL
          </button>
        </div>
      </div>
    </nav>
  );
}
