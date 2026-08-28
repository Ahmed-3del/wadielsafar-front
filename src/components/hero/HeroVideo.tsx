"use client";

import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  src: string;
  poster: string;
}

/*
 * Background video, mounted only where it is actually appropriate.
 *
 * The <video> element is not rendered at all until the client confirms a wide
 * viewport and no reduced-motion preference. That keeps a multi-megabyte file
 * off mobile connections — most of this site's traffic arrives from Instagram
 * and TikTok on cellular — and honours the motion preference properly rather
 * than autoplaying something a user asked not to see. Until then (and always,
 * underneath) the poster image is what shows, so the hero paints immediately.
 */
export function HeroVideo({ src, poster }: HeroVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => { setEnabled(wide.matches && !still.matches); };
    sync();

    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      // Decorative background: it carries no information the copy doesn't.
      aria-hidden="true"
      tabIndex={-1}
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
