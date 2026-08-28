"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Combobox, type ComboboxItem } from "@/components/ui/Combobox";
import {
  DEFAULT_ISO2,
  DIAL_CODES,
  PREFERRED_ISO2,
  dialFor,
  iso2ForNumber,
} from "@/lib/constants/dial-codes";
import { toNationalDigits } from "@/lib/utils/phone";
import { cn } from "@/lib/utils/cn";

interface PhoneFieldProps {
  id?: string;
  /** The stored number: "+966501234567", or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  className?: string;
}

/*
 * Country code picker plus a national number.
 *
 * Before this, the forms demanded a number already in international format.
 * The message said so, but a Saudi traveller types the number the way they
 * always type it — 05… — and got told it was wrong. Asking which country
 * instead of asking them to reformat is the same information without the
 * homework, and it is the only way the leading zero can be dropped safely:
 * stripping it without knowing the country would mangle an international
 * number.
 */
export function PhoneField({
  id,
  value,
  onChange,
  onBlur,
  hasError,
  className,
}: PhoneFieldProps) {
  const t = useTranslations("Picker");
  const tRequest = useTranslations("RequestForm");
  const locale = useLocale();

  const [iso2, setIso2] = useState(() => iso2ForNumber(value)?.iso2 ?? DEFAULT_ISO2);
  const [national, setNational] = useState(() => {
    const match = iso2ForNumber(value);
    return match ? toNationalDigits(value.replace(/^\+/, "").slice(match.dial.length)) : "";
  });

  // What this component last emitted, so an external reset can be told apart
  // from our own update echoing back.
  const emitted = useRef(value);

  useEffect(() => {
    if (value === emitted.current) return;
    const match = iso2ForNumber(value);
    setIso2(match?.iso2 ?? DEFAULT_ISO2);
    setNational(
      match ? toNationalDigits(value.replace(/^\+/, "").slice(match.dial.length)) : "",
    );
    emitted.current = value;
  }, [value]);

  function emit(nextIso2: string, nextNational: string) {
    // An empty field is empty, not a bare dial code — otherwise "+966" would
    // satisfy a required check.
    const next = nextNational ? `+${dialFor(nextIso2)}${nextNational}` : "";
    emitted.current = next;
    onChange(next);
  }

  /* Names come from the browser rather than a translation table, so the list
     reads correctly in Arabic and English and cannot fall out of date. */
  const countries: ComboboxItem[] = useMemo(() => {
    const display = new Intl.DisplayNames([locale], { type: "region" });
    const named = DIAL_CODES.map((entry) => ({
      value: entry.iso2,
      /* Wrapped in a directional isolate. "+" carries no direction of its
         own, so inside Arabic text "+966" renders as "966+". U+2066/U+2069
         are invisible and scoped to this string, and leave the Arabic country
         name beside it running right to left as it should. */
      label: `\u2066+${entry.dial}\u2069`,
      description: display.of(entry.iso2) ?? entry.iso2,
      countryCode: entry.iso2,
    }));

    const rank = (iso: string) => {
      const index = PREFERRED_ISO2.indexOf(iso as (typeof PREFERRED_ISO2)[number]);
      return index === -1 ? PREFERRED_ISO2.length : index;
    };
    return named.sort(
      (a, b) =>
        rank(a.value) - rank(b.value) ||
        (a.description ?? "").localeCompare(b.description ?? "", locale),
    );
  }, [locale]);

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Fixed width: the dial code is at most five characters, and letting it
          size to content made the number field jump on every country change. */}
      <Combobox
        variant="inline"
        className="w-32 shrink-0"
        value={iso2}
        onChange={(next) => {
          setIso2(next);
          emit(next, national);
        }}
        items={countries}
        labels={{
          listbox: t("countryListbox"),
          empty: t("empty"),
          loading: t("loading"),
        }}
      />

      {/* dir="ltr" and a numeric keypad: a phone number is digits read left to
          right whichever way the page runs. */}
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        dir="ltr"
        placeholder={tRequest("phonePlaceholder")}
        value={national}
        onChange={(event) => {
          const next = toNationalDigits(event.target.value);
          setNational(next);
          emit(iso2, next);
        }}
        onBlur={onBlur}
        className={cn(
          "w-full min-w-0 flex-1 rounded-xl border bg-white px-4 py-3 text-base text-navy-900 transition-colors placeholder:text-sand-400 focus:outline-none",
          hasError ? "border-danger-600 focus:border-danger-600" : "border-sand-200 focus:border-gold-500",
        )}
      />
    </div>
  );
}
