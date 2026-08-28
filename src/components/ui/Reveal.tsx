"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in ms. Keep under ~240 or the list feels slow. */
  delay?: number;
  className?: string;
}

/*
 * Entrance reveal on scroll. The visible class is toggled directly on the DOM
 * node rather than held in React state: this is a purely visual, one-way
 * transition, so routing it through a re-render would buy nothing and would
 * make every revealed element a state owner.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion gets the content immediately, not a faster animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("reveal-in");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (delay) node.style.transitionDelay = `${delay}ms`;
        node.classList.add("reveal-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => { observer.disconnect(); };
  }, [delay]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
