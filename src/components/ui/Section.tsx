import type { HTMLAttributes, ElementType } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function Section({ className, as: Tag = "section", ...props }: SectionProps) {
  return <Tag className={cn("py-10 sm:py-16 lg:py-20", className)} {...props} />;
}
