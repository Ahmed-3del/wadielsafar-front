"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookingField } from "./BookingField";
import { Combobox, type ComboboxItem } from "@/components/ui/Combobox";
import { GlobeIcon, ShipIcon } from "@/components/ui/icons";
import type { CruisePort } from "@/types/cruise";

interface CruiseRoutePickerProps {
  ports: CruisePort[];
  /** ISO 3166-1 alpha-2 of the chosen country, or "" for any. */
  country: string;
  onCountryChange: (country: string) => void;
  /** Port code, or "" for any port in the country. */
  port: string;
  onPortChange: (port: string) => void;
}

/*
 * "Which country, then which of its ports" — the two halves of a cruise
 * search, in that order.
 *
 * A flat list of a hundred ports is not a question anyone can answer: nobody
 * knows that a Rome sailing leaves from Civitavecchia. Asking for the country
 * first cuts the list to a handful and turns the second field into a choice
 * rather than a memory test.
 *
 * The country list is derived from the ports rather than fetched: a country
 * with no port cannot be sailed from, so offering it would be offering an
 * empty result.
 */
export function CruiseRoutePicker({
  ports,
  country,
  onCountryChange,
  port,
  onPortChange,
}: CruiseRoutePickerProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const countryItems = useMemo<ComboboxItem[]>(() => {
    const byCode = new Map<string, { label: string; count: number }>();
    for (const row of ports) {
      if (!row.country_code) continue;
      const existing = byCode.get(row.country_code);
      if (existing) {
        existing.count += 1;
      } else {
        byCode.set(row.country_code, {
          label: isArabic ? row.country_ar : row.country_en,
          count: 1,
        });
      }
    }

    return [...byCode.entries()]
      .sort((a, b) => a[1].label.localeCompare(b[1].label, locale))
      .map(([code, { label, count }]) => ({
        value: code,
        label,
        description: t("portCount", { count }),
      }));
  }, [ports, isArabic, locale, t]);

  const portItems = useMemo<ComboboxItem[]>(() => {
    const rows = country ? ports.filter((row) => row.country_code === country) : ports;
    return rows.map((row) => ({
      value: row.code,
      // The city leads: someone sails "from Rome", and Civitavecchia is the
      // detail that explains the ticket.
      label: isArabic ? row.city_ar : row.city_en,
      description: isArabic ? row.name_ar : row.name_en,
    }));
  }, [ports, country, isArabic]);

  return (
    <>
      <BookingField label={t("cruiseCountry")} icon={<GlobeIcon className="h-5 w-5" />}>
        <Combobox
          name="country"
          variant="widget"
          value={country}
          onChange={(next) => {
            onCountryChange(next);
            // The port that was chosen belongs to the country that was
            // chosen. Keeping it would search Barcelona sailings under Italy.
            onPortChange("");
          }}
          items={countryItems}
          placeholder={t("anyCountry")}
          labels={{
            listbox: t("countryListbox"),
            empty: t("noCountries"),
            loading: t("loading"),
          }}
        />
      </BookingField>

      <BookingField label={t("departurePort")} icon={<ShipIcon className="h-5 w-5" />}>
        <Combobox
          name="port"
          variant="widget"
          value={port}
          onChange={onPortChange}
          items={portItems}
          placeholder={country ? t("anyPortInCountry") : t("anyPort")}
          labels={{
            listbox: t("portListbox"),
            empty: t("noPorts"),
            loading: t("loading"),
          }}
        />
      </BookingField>
    </>
  );
}
