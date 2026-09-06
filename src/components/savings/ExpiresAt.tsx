"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ExpiresAtProps {
  /** ISO instant after which the children are gone. */
  endsAt: string;
  /** Whether the deadline had already passed when the server rendered this. */
  expiredOnServer: boolean;
  children: ReactNode;
}

/*
 * Hides what it wraps once a deadline passes, without a reload.
 *
 * The server already drops promotions that ended before the request, so this
 * only matters to a page left open across the deadline — but that is exactly
 * the reader an expired offer would mislead, and a card whose countdown has
 * vanished while the card remains is worse than either.
 *
 * The initial state comes from the server's own verdict, so the first client
 * render matches the HTML.
 */
export function ExpiresAt({ endsAt, expiredOnServer, children }: ExpiresAtProps) {
  const [expired, setExpired] = useState(expiredOnServer);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const check = () => {
      const remaining = new Date(endsAt).getTime() - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        return;
      }
      // setTimeout takes a 32-bit delay: anything past about 24 days
      // overflows and fires immediately, which would hide a card weeks early.
      // So a distant deadline is slept towards in six-hour steps.
      timer = setTimeout(check, Math.min(remaining, 21_600_000));
    };

    // Through a timer even for the first check, so nothing sets state
    // synchronously while the effect is running.
    timer = setTimeout(check, 0);
    return () => { clearTimeout(timer); };
  }, [endsAt]);

  if (expired) return null;

  return <>{children}</>;
}
