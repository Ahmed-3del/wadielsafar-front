"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PlaneMarkIcon } from "@/components/ui/icons";

/** Safety net: a click that never becomes a navigation must not leave the
 *  beam creeping across the top of the page forever. */
const STALL_TIMEOUT_MS = 12_000;

function restart(node: HTMLElement, className: string) {
  node.classList.remove(className);
  // Reading layout flushes the removal, so re-adding the class starts the
  // animation again instead of being coalesced into a no-op.
  void node.offsetWidth;
  node.classList.add(className);
}

interface RouteTransitionProps {
  children: ReactNode;
}

/*
 * Two halves of the same idea: a plane-tipped beam that appears the moment a
 * link is clicked, and a short rise-and-fade on the content that replaces it.
 *
 * Both are driven by toggling classes on DOM nodes rather than React state.
 * These are one-way visual effects with no bearing on what is rendered, so
 * putting them in state would re-render the entire page subtree on every
 * navigation to change an animation — and this component wraps the whole site.
 *
 * The click listener is what makes the beam useful: usePathname only changes
 * once the new route has committed, which is the end of the wait, not the
 * start of it. Catching the click gives the traveller feedback during the
 * network round trip instead of after it.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const beamRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const stallTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;

    const handleClick = (event: MouseEvent) => {
      // Anything the browser will not handle as a plain in-app navigation:
      // modified clicks open a new tab, and the page we are on stays put.
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      // Same page with different query or hash: no route change to wait for.
      if (target.pathname === window.location.pathname) return;

      beam.classList.remove("is-done");
      beam.style.removeProperty("width");
      restart(beam, "is-loading");

      window.clearTimeout(stallTimer.current);
      stallTimer.current = window.setTimeout(() => {
        beam.classList.remove("is-loading", "is-done");
      }, STALL_TIMEOUT_MS);
    };

    // Capture phase, not bubble: next/link calls preventDefault() on the
    // anchor itself, so a bubble-phase listener only ever sees clicks that are
    // already defaultPrevented and can no longer tell a navigation from a
    // cancelled one. Capturing puts us ahead of the router.
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.clearTimeout(stallTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const beam = beamRef.current;
    if (beam?.classList.contains("is-loading")) {
      window.clearTimeout(stallTimer.current);
      // Pin the width the creep reached; without it the finish animation would
      // restart from the base width of 0 and snap backwards before completing.
      beam.style.width = window.getComputedStyle(beam).width;
      beam.classList.remove("is-loading");
      restart(beam, "is-done");
    }

    const content = contentRef.current;
    if (content) restart(content, "page-enter");
  }, [pathname]);

  return (
    <>
      <div ref={beamRef} className="route-beam" aria-hidden="true">
        <PlaneMarkIcon className="route-beam__plane" />
      </div>
      <main ref={contentRef} className="page-enter flex-1">
        {children}
      </main>
    </>
  );
}
