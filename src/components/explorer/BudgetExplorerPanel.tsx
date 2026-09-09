"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PackageCard } from "@/components/packages/PackageCard";
import { buttonVariants } from "@/components/ui/Button";
import { ResetIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import {
  ANY_TRIP_TYPE,
  budgetBandFor,
  filterByBudget,
  NIGHTS_BANDS,
  tripTypesOf,
  type NightsBand,
} from "@/features/package-discovery";
import type { Package } from "@/types/package";

interface BudgetExplorerPanelProps {
  packages: Package[];
  min: number;
  max: number;
  step: number;
}

/* Shared by every chip in the bar, so trip type and trip length read as one
   control rather than two that happen to sit near each other. h-10 rather
   than the h-11 this used to be — it matches the purpose chips on /visas,
   and on a phone four or five of these used to wrap into two full rows per
   group; shaved height times two groups was real scroll saved. */
const CHIP = "h-10 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-all duration-200 ease-out-soft";
const CHIP_ON = "border-gold-500 bg-gold-50 text-navy-900";
const CHIP_OFF = "border-sand-200 text-sand-600 hover:border-navy-300 hover:text-navy-900";

/*
 * A chip row that scrolls on a phone instead of wrapping.
 *
 * Four nights-bands and five trip-types both used to `flex-wrap`, which on a
 * 360px phone meant two full rows each — the two groups alone ran past 200px
 * before the results ever came into view. Scrolling keeps every option
 * reachable in the height of one chip; `sm` and up have the width to spare,
 * so they go back to wrapping, which shows every option without a swipe.
 */
const CHIP_ROW =
  "-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0";

/*
 * The interactive half. It filters a catalogue the server already fetched
 * rather than querying on every drag: the whole package list is small, and a
 * request per slider tick would make the results lag behind the thumb.
 */
export function BudgetExplorerPanel({ packages, min, max, step }: BudgetExplorerPanelProps) {
  const t = useTranslations("Explorer");
  const tPackages = useTranslations("Packages");
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Opens showing everything, so the first impression is the catalogue rather
  // than a filter someone has to undo.
  const [budget, setBudget] = useState(max);
  const [nights, setNights] = useState<NightsBand>("any");
  const [tripType, setTripType] = useState<string>(ANY_TRIP_TYPE);

  // Guarded: a catalogue priced at a single point would divide by zero.
  const fillPercent = max > min ? ((budget - min) / (max - min)) * 100 : 100;

  // Read off the catalogue, so a chip can never offer a filter that matches
  // nothing and the labels are the ones the admin set in the panel.
  const tripTypes = useMemo(() => tripTypesOf(packages), [packages]);

  const results = useMemo(
    () => filterByBudget(packages, { budget, nights, tripType }),
    [packages, budget, nights, tripType],
  );

  const touched = budget !== max || nights !== "any" || tripType !== ANY_TRIP_TYPE;

  const reset = () => {
    setBudget(max);
    setNights("any");
    setTripType(ANY_TRIP_TYPE);
  };

  return (
    <div>
      <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        {/* Both columns open with a label row of the same height and the grid
            aligns to the top, so "Budget per person" and "Trip length" sit on
            one line. Bottom-aligning them, as this did, lines up the feet of
            two blocks that are not the same height and nothing else.
            `sm:grid-cols-2` a step before the `lg` two-up split: a phone in
            landscape or a small tablet has the width for two columns before
            it has the width for the wider auto-sized second one. */}
        <div className="grid items-start gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="flex h-7 items-center justify-between gap-4">
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
              className="range-gold mt-3"
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
            <p className="flex h-7 items-center text-sm font-medium text-navy-900">
              {t("nightsLabel")}
            </p>
            <div role="radiogroup" aria-label={t("nightsLabel")} className={cn("mt-3", CHIP_ROW)}>
              {NIGHTS_BANDS.map((band) => {
                const selected = band === nights;
                return (
                  <button
                    key={band}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => { setNights(band); }}
                    className={cn(CHIP, selected ? CHIP_ON : CHIP_OFF)}
                  >
                    {t(`nights.${band}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* What kind of trip, which is how people actually describe what they
            are after — "a honeymoon", "Umrah" — before they think about price.
            Hidden when the catalogue only holds one kind: a filter with a
            single option filters nothing. */}
        {tripTypes.length > 1 ? (
          <div className="mt-5 border-t border-sand-200 pt-4">
            <p className="text-sm font-medium text-navy-900">{t("tripTypeLabel")}</p>
            <div
              role="radiogroup"
              aria-label={t("tripTypeLabel")}
              className={cn("mt-3", CHIP_ROW)}
            >
              <button
                type="button"
                role="radio"
                aria-checked={tripType === ANY_TRIP_TYPE}
                onClick={() => { setTripType(ANY_TRIP_TYPE); }}
                className={cn(CHIP, tripType === ANY_TRIP_TYPE ? CHIP_ON : CHIP_OFF)}
              >
                {t("anyTripType")}
              </button>
              {tripTypes.map((type) => {
                const selected = type.slug === tripType;
                return (
                  <button
                    key={type.slug}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => { setTripType(type.slug); }}
                    className={cn(CHIP, selected ? CHIP_ON : CHIP_OFF)}
                  >
                    {isArabic ? type.name_ar : type.name_en}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* The count belongs to the filters, not to the results: it is the
            answer to the last thing the reader touched, and it was sitting
            outside the card where a change to a chip left it unnoticed. */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <p aria-live="polite" className="text-sm font-semibold text-navy-900">
            {t("count", { count: results.length })}
          </p>

          <button
            type="button"
            onClick={reset}
            disabled={!touched}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-sand-600 transition-colors hover:bg-sand-100 hover:text-navy-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <ResetIcon className="h-4 w-4" />
            {t("reset")}
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <ScrollGrid
          label={t("title")}
          gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          className="mt-6"
        >
          {results.slice(0, 6).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </ScrollGrid>
      ) : (
        /* An empty result is the most valuable moment here, not a dead end:
           this is a traveller who has just told us their budget and found
           nothing off the shelf. */
        <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-navy-900">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-sand-600">{t("emptyBody")}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/packages/plan?budget=${budgetBandFor(budget)}`}
              className={buttonVariants("primary", "md")}
            >
              {tPackages("planCta")}
            </Link>
            {/* The way out, next to the offer to build something — undoing the
                filters is usually the quicker of the two. */}
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants("outline", "md"), "gap-1.5")}
            >
              <ResetIcon className="h-4 w-4" />
              {t("reset")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
