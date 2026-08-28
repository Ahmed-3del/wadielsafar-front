"use client";

import { useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronNextIcon, ChevronPrevIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface RailProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the scrollable region. */
  label: string;
}

/*
 * Horizontal content rail. On mobile it is a plain snap-scroll list — thumbs
 * are better at this than any custom carousel — and arrow controls only appear
 * from lg up, where there is no touch affordance. Native scrolling means
 * keyboard and screen readers work without extra wiring.
 */
export function Rail({ children, className, label }: RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Common2");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const scrollBy = (direction: "prev" | "next") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.8;
    // In RTL, scrollLeft runs negative, so "next" is still a negative delta.
    const sign = direction === "next" ? 1 : -1;
    node.scrollBy({ left: (isRtl ? -sign : sign) * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2",
          "sm:gap-6 lg:mx-0 lg:px-0",
          className,
        )}
      >
        {children}
      </div>

      <div className="pointer-events-none absolute inset-y-0 hidden w-full items-center justify-between lg:flex">
        {(["prev", "next"] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            aria-label={direction === "prev" ? t("previous") : t("next")}
            onClick={() => { scrollBy(direction); }}
            className={cn(
              "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-sand-200",
              "bg-white/95 text-navy-900 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg",
              // The flex container reverses under RTL, so each control lands on
              // the opposite edge and must be nudged outward the other way.
              direction === "prev"
                ? "-translate-x-1/2 rtl:translate-x-1/2"
                : "translate-x-1/2 rtl:-translate-x-1/2",
            )}
          >
            {direction === "prev" ? (
              <ChevronPrevIcon className="h-5 w-5" />
            ) : (
              <ChevronNextIcon className="h-5 w-5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
