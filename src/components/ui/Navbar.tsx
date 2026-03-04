"use client";

import Link from "next/link";
import { useLanguage, useTheme } from "@/components/ui/Providers";

export function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass animate-slide-down">
      <div className="max-w-[--container-max] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-[18px] font-bold text-[--text-primary] transition-transform duration-300 group-hover:scale-105">
            Interview<span className="gradient-text">Ready</span>
          </span>
          <span className="text-[11px] font-medium text-[--text-muted] bg-[--bg-card] px-2 py-0.5 rounded-full border border-[--glass-border]">
            PH
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center bg-[--bg-elevated] rounded-lg p-0.5 border border-[--glass-border]">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-300 ${
                language === "en"
                  ? "bg-gradient-to-r from-[#FF6D3F] to-[#FF9040] text-white shadow-sm"
                  : "text-[--text-muted] hover:text-[--text-secondary]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("tl")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-300 ${
                language === "tl"
                  ? "bg-gradient-to-r from-[#FF6D3F] to-[#FF9040] text-white shadow-sm"
                  : "text-[--text-muted] hover:text-[--text-secondary]"
              }`}
            >
              TL
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="theme-toggle-knob flex items-center justify-center">
              {theme === "dark" ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
