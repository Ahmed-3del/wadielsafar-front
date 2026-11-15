import type { HTMLAttributes, ElementType } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function Section({ className, as: Tag = "section", ...props }: SectionProps) {
  return <Tag className={cn("py-6 sm:py-8 lg:py-10", className)} {...props} />;
}
