"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownProps {
  /** ISO instant the offer ends. */
  endsAt: string;
  /** Milliseconds remaining as the server rendered it, so the first client
   *  render matches the HTML instead of tripping hydration. */
  initialRemaining: number;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
}

function partsOf(remainingMs: number): Parts {
  const total = Math.max(remainingMs, 0);
  const minutes = Math.floor(total / 60_000);
  return {
    days: Math.floor(minutes / 1_440),
    hours: Math.floor((minutes % 1_440) / 60),
    minutes: minutes % 60,
  };
}

/*
 * Days, hours and minutes to the end of an offer.
 *
 * The deadline is a record in the panel, so this is never counting down to a
 * date the site made up — and when the clock runs out the block disappears
 * rather than sitting at zero, which is what a stale timer does to a promise.
 *
 * It ticks every fifteen seconds. The smallest unit shown is a minute, so a
 * per-second interval would re-render fifty-nine times for nothing.
 */
export function Countdown({ endsAt, initialRemaining }: CountdownProps) {
  const t = useTranslations("Savings");
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    const tick = () => { setRemaining(target - Date.now()); };

    tick();
    const id = setInterval(tick, 15_000);
    return () => { clearInterval(id); };
  }, [endsAt]);

  if (remaining <= 0) return null;

  const parts = partsOf(remaining);

  return (
    <div className="mt-4 flex gap-2" role="timer" aria-live="off" aria-label={t("endsIn")}>
      {(["days", "hours", "minutes"] as const).map((unit) => (
        <div
          key={unit}
          className="flex min-w-14 flex-1 flex-col items-center rounded-xl bg-navy-900 px-2 py-2 text-white"
        >
          {/* dir="ltr" on the number: two digits are read left to right in
              both languages, and a leading zero must stay leading. */}
          <span dir="ltr" className="text-xl font-bold tabular-nums text-gold-400">
            {String(parts[unit]).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
            {t(`units.${unit}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
