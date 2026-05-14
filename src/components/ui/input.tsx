import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#e2e8f0]">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-[#1e1e2e] bg-[#0f0f1a] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-all duration-200",
              "focus:outline-none focus:ring-1 focus:ring-[#4f8ef7]/50 focus:border-[#4f8ef7]/40",
              "hover:border-[#2e2e4e]",
              "h-9",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-red-500/50 focus:ring-red-500/30",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-[#475569]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
