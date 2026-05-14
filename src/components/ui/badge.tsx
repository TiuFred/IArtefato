import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "blue" | "purple" | "green" | "amber" | "red" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#1e1e2e] text-[#94a3b8] border-[#2e2e4e]",
      blue: "bg-[#4f8ef7]/10 text-[#4f8ef7] border-[#4f8ef7]/20",
      purple: "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
      green: "bg-[#10d98c]/10 text-[#10d98c] border-[#10d98c]/20",
      amber: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      red: "bg-red-400/10 text-red-400 border-red-400/20",
      outline: "bg-transparent text-[#94a3b8] border-[#1e1e2e]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
