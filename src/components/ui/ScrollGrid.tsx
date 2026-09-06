import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ScrollGridProps {
  children: ReactNode;
  /** Accessible name for the scrollable region on small screens. */
  label: string;
  /** Grid classes applied from `sm` up, e.g. "sm:grid-cols-2 lg:grid-cols-3". */
  gridClassName: string;
  className?: string;
}

/*
 * A swipeable row on a phone, a grid everywhere else — from one element and no
 * JavaScript.
 *
 * Every card block on the homepage was a single-column stack below `sm`, which
 * is what made the page eighteen screens long: six service cards became two
 * full screens of scrolling before the visitor reached anything else. A rail
 * costs one screen and puts the rest a thumb-flick away, which is how people
 * browse on a phone anyway.
 *
 * The `Rail` component does this too, but as a client component with arrow
 * controls for pointer users. This is the version for blocks that only need
 * the mobile behaviour and should stay server-rendered.
 */
export function ScrollGrid({ children, label, gridClassName, className }: ScrollGridProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        // `relative` is load-bearing, not cosmetic. A scroll container only
        // clips an absolutely positioned descendant when it is that
        // descendant's containing block, and a static one is not — so the
        // `sr-only` span inside each card escaped the rail at its scroll
        // position and dragged the whole page 233px sideways.
        "relative",
        // Mobile: a snap scroller that bleeds to the screen edges, so the next
        // card peeks in and the row reads as scrollable without an affordance.
        "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2",
        // Children need a width to scroll against. The same 85vw the Rail
        // gives its cards, and in the same unit: the scroller bleeds to both
        // screen edges, so a percentage of it and a percentage of the screen
        // are the same thing — but only one of them stays equal to the Rail's
        // when the container padding changes.
        "[&>*]:w-[85vw] [&>*]:shrink-0 [&>*]:snap-start",
        // From sm up it is an ordinary grid again, and the mobile-only rules
        // are unwound so the cards fill their cells.
        "sm:mx-0 sm:grid sm:snap-none sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0",
        "sm:[&>*]:w-auto sm:[&>*]:shrink",
        gridClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
