"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: "blue" | "purple" | "green" | "amber";
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color = "blue", size = "md", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
      blue: "bg-[#4f8ef7]",
      purple: "bg-[#8b5cf6]",
      green: "bg-[#10d98c]",
      amber: "bg-amber-400",
    };

    const sizes = {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-[#1e1e2e]",
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
