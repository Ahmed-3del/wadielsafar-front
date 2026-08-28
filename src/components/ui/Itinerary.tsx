import { cn } from "@/lib/utils/cn";

export interface ItineraryItem {
  id: number;
  day: number;
  title: string;
  description?: string;
}

interface ItineraryProps {
  items: ItineraryItem[];
  /** Localised "Day N" label, supplied by the caller. */
  dayLabel: (day: number) => string;
  className?: string;
}

/*
 * Day-by-day programme — the البرنامج اليومي for packages and the خط سير الرحلة
 * for cruises. One component for both: the shape is identical and the two would
 * otherwise drift apart visually.
 *
 * The connecting line is drawn on each item except the last rather than as a
 * single absolutely-positioned rail, so it cannot overshoot when the final
 * entry is short.
 */
export function Itinerary({ items, dayLabel, className }: ItineraryProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-11 h-[calc(100%-2.75rem)] w-px bg-sand-200 start-5"
            />
          ) : null}
          <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-gold-400">
            {item.day}
          </span>
          <div className="min-w-0 flex-1 pt-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
              {dayLabel(item.day)}
            </p>
            <h3 className="mt-1 text-lg font-bold text-navy-900">{item.title}</h3>
            {item.description ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-sand-600">
                {item.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
