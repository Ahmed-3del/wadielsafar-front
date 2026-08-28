"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Combobox, type ComboboxItem } from "@/components/ui/Combobox";
import { getPopularAirports, searchAirports } from "@/lib/api/airports";
import type { Airport } from "@/types/airport";

/* One request per page load, however many pickers are on it. The flights form
 * alone has two, and they would otherwise ask for the same twelve rows twice. */
let popularRequest: Promise<Airport[]> | null = null;

function loadPopularOnce(): Promise<Airport[]> {
  popularRequest ??= getPopularAirports()
    .then((page) => page.results)
    .catch(() => {
      // Let a failed attempt be retried rather than cached as "no airports".
      popularRequest = null;
      return [];
    });
  return popularRequest;
}

/**
 * `airport` answers a question about a flight, so the value carries the code:
 * "الرياض (RUH)". `city` answers a question about a place to stay, where the
 * code is noise and "جدة" is the whole answer.
 */
export type PickerMode = "airport" | "city";

/*
 * The airport catalogue in one place, so departure, arrival and every request
 * form present it in the same shape.
 *
 * The submitted value is the display label rather than the bare code. What is
 * on the other end of this field is an agent reading a WhatsApp message and an
 * inquiry row in the panel, and "RUH" alone asks them to translate.
 */
export function airportToItem(
  airport: Airport,
  isArabic: boolean,
  mode: PickerMode = "airport",
): ComboboxItem {
  const city = isArabic ? airport.city_ar : airport.city_en;
  const country = isArabic ? airport.country_ar : airport.country_en;
  const name = isArabic ? airport.name_ar : airport.name_en;
  const isAirport = mode === "airport";
  return {
    value: isAirport ? `${city} (${airport.iata_code})` : city,
    label: city,
    description: isAirport ? `${name} · ${country}` : country,
    badge: isAirport ? airport.iata_code : undefined,
    countryCode: airport.country_code,
  };
}

/* Dubai has two airports and one name. In city mode they collapse to a single
 * row, because offering the same word twice asks a question with no answer. */
function toItems(airports: Airport[], isArabic: boolean, mode: PickerMode): ComboboxItem[] {
  const items = airports.map((airport) => airportToItem(airport, isArabic, mode));
  if (mode === "airport") return items;
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.value) ? false : (seen.add(item.value), true)));
}

interface AirportPickerProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  /** Rendered before the traveller types. Fetched on the server so the first
   *  open needs no round trip. */
  popular?: Airport[];
  variant?: "widget" | "form";
  mode?: PickerMode;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function AirportPicker({
  name,
  value,
  onChange,
  popular = [],
  variant = "form",
  mode = "airport",
  id,
  required,
  placeholder,
  className,
}: AirportPickerProps) {
  const t = useTranslations("Picker");
  const isArabic = useLocale() === "ar";

  /* The hero hands its list down from the server so the first open is instant.
     Forms deeper in the site have no such prop, so they fetch it themselves. */
  const [fetched, setFetched] = useState<Airport[]>([]);
  const needsFetch = popular.length === 0;

  useEffect(() => {
    if (!needsFetch) return;
    let live = true;
    void loadPopularOnce().then((rows) => { if (live) setFetched(rows); });
    return () => { live = false; };
  }, [needsFetch]);

  const suggestions = needsFetch ? fetched : popular;

  const initialItems = useMemo(
    () => toItems(suggestions, isArabic, mode),
    [suggestions, isArabic, mode],
  );

  const loadItems = useCallback(
    async (term: string, signal: AbortSignal) => {
      const page = await searchAirports(term, 8, signal);
      return toItems(page.results, isArabic, mode);
    },
    [isArabic, mode],
  );

  return (
    <Combobox
      name={name}
      id={id}
      value={value}
      onChange={(next) => { onChange(next); }}
      loadItems={loadItems}
      initialItems={initialItems}
      variant={variant}
      required={required}
      className={className}
      // A traveller may want a city the catalogue does not carry. Refusing the
      // answer would lose the enquiry over a gap in reference data.
      allowCustom
      placeholder={placeholder ?? t(mode === "airport" ? "airportPlaceholder" : "cityPlaceholder")}
      labels={{
        listbox: t("airportListbox"),
        empty: t("empty"),
        loading: t("loading"),
        suggestions: t("popular"),
      }}
    />
  );
}
