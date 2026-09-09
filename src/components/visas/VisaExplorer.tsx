"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { VisaCard } from "./VisaCard";
import { VisaCountryRail } from "./VisaCountryRail";
import { EmptyState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { VISA_PURPOSES, type VisaCountry, type VisaPurpose, type VisaType } from "@/types/visa";
import { cn } from "@/lib/utils/cn";

interface VisaExplorerProps {
  visas: VisaType[];
  countries: VisaCountry[];
  /** Preselected country id, e.g. arriving from the homepage booking widget. */
  initialCountry?: string;
  /** Preselected purpose, from the same widget. */
  initialPurpose?: VisaPurpose;
}

/*
 * Country filtering happens on the client against an already-loaded list.
 * The catalogue is small enough that a round trip per filter would add latency
 * for no benefit, and instant filtering is what makes "which visa do I need?"
 * feel answered rather than searched.
 */
export function VisaExplorer({
  visas,
  countries,
  initialCountry,
  initialPurpose,
}: VisaExplorerProps) {
  const t = useTranslations("Visas");
  const [country, setCountry] = useState(initialCountry ?? "");
  const [purpose, setPurpose] = useState<VisaPurpose>(initialPurpose ?? "");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visas.filter((visa) => {
      if (country && String(visa.country.id) !== country) return false;
      if (purpose && visa.purpose !== purpose) return false;
      if (!q) return true;
      return [visa.name_ar, visa.name_en, visa.country.name_ar, visa.country.name_en]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [visas, country, purpose, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="relative flex flex-1 items-center gap-3 rounded-full border border-sand-200 bg-white px-5 py-3 shadow-sm focus-within:border-gold-500">
          <SearchIcon className="h-5 w-5 shrink-0 text-sand-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-base text-navy-900 placeholder:text-sand-400 focus:outline-none"
            aria-label={t("searchPlaceholder")}
          />
        </label>
      </div>

      <div className="mt-6">
        <VisaCountryRail
          countries={countries}
          selected={country}
          onSelect={setCountry}
          allLabel={t("allCountries")}
        />
      </div>

      {/* Visible rather than implicit: someone arriving from the homepage with
          a purpose already chosen should be able to see it and widen it, not
          wonder why half the visas are missing. */}
      <div className="mt-5">
        <p className="text-sm font-medium text-navy-900">{t("purposeLabel")}</p>
        <div
          role="radiogroup"
          aria-label={t("purposeLabel")}
          className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          {VISA_PURPOSES.map((option) => {
            const selected = option === purpose;
            return (
              <button
                key={option || "all"}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => { setPurpose(option); }}
                className={cn(
                  "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-all duration-200 ease-out-soft",
                  selected
                    ? "border-gold-500 bg-gold-50 text-navy-900"
                    : "border-sand-200 bg-white text-sand-600 hover:border-navy-300 hover:text-navy-900",
                )}
              >
                {t(`purposes.${option || "ALL"}`)}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((visa) => (
            <VisaCard key={visa.id} visa={visa} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("noResults")}
          description={t("noResultsBody")}
          className="mt-8"
        />
      )}
    </div>
  );
}
