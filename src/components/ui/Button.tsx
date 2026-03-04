"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-[12px] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2 focus-visible:ring-offset-[--bg-base] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-[#FF6D3F] to-[#FF9040] text-white hover:shadow-[0_0_30px_rgba(255,109,63,0.3)] hover:scale-[1.02] active:scale-[0.98]",
    secondary:
      "bg-[--bg-card] border border-[--border] text-[--text-primary] hover:border-[--border-active] hover:bg-[--bg-elevated]",
    ghost:
      "bg-transparent text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-card]",
    danger:
      "bg-[--danger] text-white hover:opacity-90",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-[13px]",
    md: "px-6 py-3 text-[14px]",
    lg: "px-8 py-4 text-[16px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
