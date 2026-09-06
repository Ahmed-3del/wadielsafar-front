"use client";

import { useRef, useState, type PointerEvent, type MouseEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronNextIcon, ChevronPrevIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface RailProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the scrollable region. */
  label: string;
}

/** Past this many pixels a press is a drag, and the card under it must not
 *  open when the button comes up. Below it, a shaky click is still a click. */
const DRAG_THRESHOLD = 5;

/*
 * Horizontal content rail. On mobile it is a plain snap-scroll list — thumbs
 * are better at this than any custom carousel — and from lg up it adds arrows
 * and click-and-drag, because a mouse has neither a thumb nor an obvious way
 * to scroll sideways. Native scrolling underneath means keyboard and screen
 * readers work without extra wiring.
 */
export function Rail({ children, className, label }: RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Common2");
  const locale = useLocale();
  const isRtl = locale === "ar";

  /*
   * Drag state lives in a ref, not in state: it changes on every pointermove
   * and a re-render per mouse pixel would make the drag itself stutter. The
   * one thing the render does care about — whether a drag is in progress, for
   * the cursor — is the single piece kept in state.
   */
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const scrollBy = (direction: "prev" | "next") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.8;
    // In RTL, scrollLeft runs negative, so "next" is still a negative delta.
    const sign = direction === "next" ? 1 : -1;
    node.scrollBy({ left: (isRtl ? -sign : sign) * amount, behavior: "smooth" });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Touch and pen already scroll this natively, with momentum a hand-rolled
    // drag cannot match. Only the mouse needs help.
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const node = scrollerRef.current;
    if (!node) return;

    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: node.scrollLeft,
      moved: false,
    };
    /*
     * Deliberately no setPointerCapture here. Capturing redirects the click
     * that follows to the capturing element, so every card in a rail stopped
     * opening: the link never saw the click. Capture is taken below, once the
     * pointer has actually moved far enough to be a drag rather than a click.
     */
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = scrollerRef.current;
    if (!drag.current.active || !node) return;

    const dx = event.clientX - drag.current.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD && !drag.current.moved) {
      drag.current.moved = true;
      // Now that this is a drag and not a click, capture: it keeps the scroll
      // following the hand even when it leaves the rail, and lets a release
      // anywhere end it cleanly.
      node.setPointerCapture(event.pointerId);
    }
    // Subtracted, so the content follows the hand: dragging left scrolls right.
    // The arithmetic holds in RTL too, where scrollLeft simply runs negative.
    node.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const node = scrollerRef.current;
    if (node?.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    drag.current.active = false;
    setDragging(false);
  };

  /*
   * A drag that finishes on top of a card must not open it. Caught on the way
   * down rather than on the card itself, so no card has to know it is in a
   * rail.
   */
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        // Native image and link dragging would otherwise take over halfway
        // through and leave the rail mid-scroll.
        onDragStart={(event) => { event.preventDefault(); }}
        className={cn(
          // `relative` so the scroller is the containing block for anything
          // absolutely positioned inside a card. Without it the clip does not
          // apply to those, and one `sr-only` span was enough to drag a whole
          // page sideways — see ScrollGrid, where that actually happened.
          "no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
          "sm:gap-6",
          // The snapport is the scrollport reduced by `scroll-padding`, not by
          // `padding` — so without these the first card snapped straight past
          // the gutter below and sat under the arrow again.
          "scroll-px-4 lg:scroll-px-7",
          // A gutter the arrows can live in. With no padding here they sat on
          // top of the first and last card — 22px of a 44px button over the
          // artwork — and the row ran edge to edge with nothing to breathe in.
          "lg:mx-0 lg:px-7 lg:pb-5",
          // The cursor is the only thing that says a mouse can drag this.
          "lg:cursor-grab",
          dragging && "lg:cursor-grabbing select-none",
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
              // Centred on the row's edge, which the padding above keeps clear
              // of the cards. The flex container reverses under RTL, so each
              // control lands on the opposite edge and must be nudged the
              // other way.
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
