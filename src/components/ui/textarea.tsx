import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#e2e8f0]">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#1e1e2e] bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] resize-none transition-all duration-200",
            "focus:outline-none focus:ring-1 focus:ring-[#4f8ef7]/50 focus:border-[#4f8ef7]/40",
            "hover:border-[#2e2e4e]",
            error && "border-red-500/50 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
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
Textarea.displayName = "Textarea";

export { Textarea };
