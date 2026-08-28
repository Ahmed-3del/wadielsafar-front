import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "gold" | "navy" | "success" | "neutral" | "danger";

const toneStyles: Record<BadgeTone, string> = {
  gold: "bg-gold-500 text-navy-900",
  navy: "bg-navy-900 text-white",
  success: "bg-success-50 text-success-600",
  neutral: "bg-sand-100 text-sand-700",
  danger: "bg-danger-50 text-danger-600",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
