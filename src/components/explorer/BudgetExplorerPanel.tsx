"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PackageCard } from "@/components/packages/PackageCard";
import { buttonVariants } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import {
  budgetBandFor,
  filterByBudget,
  NIGHTS_BANDS,
  type NightsBand,
} from "@/features/package-discovery";
import type { Package } from "@/types/package";

interface BudgetExplorerPanelProps {
  packages: Package[];
  min: number;
  max: number;
  step: number;
}

/*
 * The interactive half. It filters a catalogue the server already fetched
 * rather than querying on every drag: the whole package list is small, and a
 * request per slider tick would make the results lag behind the thumb.
 */
export function BudgetExplorerPanel({ packages, min, max, step }: BudgetExplorerPanelProps) {
  const t = useTranslations("Explorer");
  const tPackages = useTranslations("Packages");
  const locale = useLocale();

  // Opens showing everything, so the first impression is the catalogue rather
  // than a filter someone has to undo.
  const [budget, setBudget] = useState(max);
  const [nights, setNights] = useState<NightsBand>("any");

  // Guarded: a catalogue priced at a single point would divide by zero.
  const fillPercent = max > min ? ((budget - min) / (max - min)) * 100 : 100;

  const results = useMemo(
    () => filterByBudget(packages, { budget, nights }),
    [packages, budget, nights],
  );

  return (
    <div>
      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Both columns open with a label row of the same height and the grid
            aligns to the top, so "Budget per person" and "Trip length" sit on
            one line. Bottom-aligning them, as this did, lines up the feet of
            two blocks that are not the same height and nothing else. */}
        <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="flex h-8 items-center justify-between gap-4">
              <label htmlFor="budget" className="text-sm font-medium text-navy-900">
                {t("budgetLabel")}
              </label>
              <output
                htmlFor="budget"
                aria-live="polite"
                className="text-lg font-bold text-gold-700 sm:text-xl"
              >
                {t("upTo", { price: formatPrice(String(budget), locale) })}
              </output>
            </div>

            <input
              id="budget"
              type="range"
              className="range-gold mt-4"
              min={min}
              max={max}
              step={step}
              value={budget}
              onChange={(event) => { setBudget(Number(event.target.value)); }}
              /* Drives the filled portion of the track. A range input gives no
                 way to style the part behind the thumb, so the fill is painted
                 as a hard-stop gradient at the current position. */
              style={{ "--range-fill": `${fillPercent}%` } as CSSProperties}
            />

            <div className="mt-2 flex h-4 items-center justify-between text-xs text-sand-500">
              <span>{formatPrice(String(min), locale)}</span>
              <span>{formatPrice(String(max), locale)}</span>
            </div>
          </div>

          <div className="lg:border-s lg:border-sand-200 lg:ps-10">
            <p className="flex h-8 items-center text-sm font-medium text-navy-900">
              {t("nightsLabel")}
            </p>
            <div
              role="radiogroup"
              aria-label={t("nightsLabel")}
              className="mt-4 flex flex-wrap gap-2"
            >
              {NIGHTS_BANDS.map((band) => {
                const selected = band === nights;
                return (
                  <button
                    key={band}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => { setNights(band); }}
                    className={cn(
                      "h-11 rounded-full border px-4 text-sm font-semibold transition-all duration-200 ease-out-soft",
                      selected
                        ? "border-gold-500 bg-gold-50 text-navy-900"
                        : "border-sand-200 text-sand-600 hover:border-navy-300 hover:text-navy-900",
                    )}
                  >
                    {t(`nights.${band}`)}
                  </button>
                );
              })}
            </div>
            {/* Keeps this column's foot level with the budget column's scale. */}
            <div aria-hidden="true" className="mt-2 hidden h-4 lg:block" />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-sm font-medium text-sand-600">
        {t("count", { count: results.length })}
      </p>

      {results.length > 0 ? (
        <ScrollGrid
          label={t("title")}
          gridClassName="sm:grid-cols-2 lg:grid-cols-3"
          className="mt-5"
        >
          {results.slice(0, 6).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </ScrollGrid>
      ) : (
        /* An empty result is the most valuable moment here, not a dead end:
           this is a traveller who has just told us their budget and found
           nothing off the shelf. */
        <div className="mt-5 rounded-2xl border border-sand-200 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-navy-900">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-sand-600">{t("emptyBody")}</p>
          <Link
            href={`/packages/plan?budget=${budgetBandFor(budget)}`}
            className={cn(buttonVariants("primary", "md"), "mt-5")}
          >
            {tPackages("planCta")}
          </Link>
        </div>
      )}
    </div>
  );
}
