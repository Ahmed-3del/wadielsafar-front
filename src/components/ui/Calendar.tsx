"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronNextIcon, ChevronPrevIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface CalendarProps {
  /** ISO date string (YYYY-MM-DD) or empty. */
  value: string;
  onChange: (iso: string) => void;
  /** Months rendered side by side from lg up; mobile always shows one. */
  months?: number;
  label?: string;
}

function toIso(date: Date) {
  // Built from local parts, not toISOString(): the latter converts to UTC and
  // shifts the date by a day for anyone east of Greenwich, which includes
  // every user of this site.
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function Calendar({ value, onChange, months = 2, label }: CalendarProps) {
  const t = useTranslations("Common2");
  const locale = useLocale();
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const monthFormatter = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
  });
  // Narrow ("ح", "S") rather than short ("الأحد", "Sun"): at seven columns on a
  // 390px screen the short Arabic names overflow their cells and run together.
  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 8, 1 + i)));
  }, [intlLocale]);

  const visibleMonths = Array.from({ length: months }, (_, i) =>
    new Date(cursor.getFullYear(), cursor.getMonth() + i, 1),
  );

  function shift(delta: number) {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div role="group" aria-label={label}>
      <div className="flex items-center justify-between gap-2">
        {/* Arrows are laid out by the flex container, so they follow the
            document direction without any RTL-specific branching. */}
        <button
          type="button"
          onClick={() => { shift(-1); }}
          aria-label={t("previous")}
          className="grid h-9 w-9 place-items-center rounded-full border border-sand-200 text-navy-700 transition-colors hover:border-navy-300 hover:bg-sand-50"
        >
          <ChevronPrevIcon className="h-4 w-4" />
        </button>
        <div className="flex flex-1 justify-around">
          {visibleMonths.map((month, index) => (
            <p
              key={month.toISOString()}
              className={cn(
                "text-sm font-bold text-navy-900",
                index > 0 && "hidden lg:block",
              )}
            >
              {monthFormatter.format(month)}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { shift(1); }}
          aria-label={t("next")}
          className="grid h-9 w-9 place-items-center rounded-full border border-sand-200 text-navy-700 transition-colors hover:border-navy-300 hover:bg-sand-50"
        >
          <ChevronNextIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        {visibleMonths.map((month, index) => (
          <MonthGrid
            key={month.toISOString()}
            month={month}
            weekdays={weekdays}
            today={today}
            value={value}
            onSelect={onChange}
            className={index > 0 ? "hidden lg:block" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthGridProps {
  month: Date;
  weekdays: string[];
  today: Date;
  value: string;
  onSelect: (iso: string) => void;
  className?: string;
}

function MonthGrid({ month, weekdays, today, value, onSelect, className }: MonthGridProps) {
  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return (
    <div className={className}>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, index) => (
          <span key={index} className="py-1 text-xs font-semibold text-sand-500">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const iso = toIso(date);
          const isPast = date < today;
          const isSelected = value === iso;

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              aria-pressed={isSelected}
              onClick={() => { onSelect(iso); }}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-colors",
                isPast && "cursor-not-allowed text-sand-300",
                !isPast && !isSelected && "text-navy-900 hover:bg-sand-100",
                isSelected && "bg-navy-900 font-bold text-white",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
