"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "subtle" | "destructive" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4f8ef7]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

    const variants = {
      default:
        "bg-[#4f8ef7] text-white hover:bg-[#3b71f5] active:bg-[#2d5de0] shadow-sm",
      ghost:
        "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5 active:bg-white/10",
      outline:
        "border border-[#1e1e2e] text-[#94a3b8] hover:border-[#4f8ef7]/50 hover:text-[#e2e8f0] hover:bg-[#4f8ef7]/5",
      subtle:
        "bg-white/5 text-[#e2e8f0] hover:bg-white/10 active:bg-white/15",
      destructive:
        "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
      glow: "bg-[#4f8ef7] text-white hover:bg-[#3b71f5] shadow-[0_0_20px_rgba(79,142,247,0.4)] hover:shadow-[0_0_30px_rgba(79,142,247,0.6)] active:bg-[#2d5de0]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs h-7",
      md: "px-4 py-2 text-sm h-9",
      lg: "px-6 py-3 text-base h-11",
      icon: "w-9 h-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
