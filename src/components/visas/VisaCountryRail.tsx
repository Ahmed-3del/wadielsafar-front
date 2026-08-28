"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { VisaCountry } from "@/types/visa";

interface VisaCountryRailProps {
  countries: VisaCountry[];
  selected: string;
  onSelect: (id: string) => void;
  allLabel: string;
}

/*
 * Country picker as a rail of circular flags. Borrowed from Direct KSA, and the
 * right call for this content: a traveller recognises a flag far faster than
 * they read a dropdown, and the rail shows the breadth of coverage at a glance.
 * Countries without a flag asset fall back to an initial rather than a gap.
 */
export function VisaCountryRail({
  countries,
  selected,
  onSelect,
  allLabel,
}: VisaCountryRailProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const entries = [
    { id: "", label: allLabel, flag: null as string | null },
    ...countries.map((c) => ({
      id: String(c.id),
      label: isArabic ? c.name_ar : c.name_en,
      flag: c.flag_image,
    })),
  ];

  return (
    <div
      role="group"
      className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
    >
      {entries.map((entry) => {
        const active = selected === entry.id;
        return (
          <button
            key={entry.id || "all"}
            type="button"
            onClick={() => { onSelect(active && entry.id ? "" : entry.id); }}
            aria-pressed={active}
            className="group flex w-18 shrink-0 flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                "grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 bg-sand-100 transition-all duration-200",
                active
                  ? "border-gold-500 shadow-md"
                  : "border-transparent group-hover:border-sand-300",
              )}
            >
              {entry.flag ? (
                <Image
                  src={entry.flag}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-navy-700">
                  {entry.label.trim().charAt(0)}
                </span>
              )}
            </span>
            <span
              className={cn(
                "line-clamp-2 text-xs font-semibold leading-tight transition-colors",
                active ? "text-navy-900" : "text-sand-600",
              )}
            >
              {entry.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
