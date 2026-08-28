import type { Locale } from "@/i18n/routing";

/*
 * Arabic formatting deliberately pins two things that `ar-SA` gets wrong for a
 * travel site:
 *   nu-latn   — `ar-SA` defaults to Arabic-Indic digits (٣٥٠). Saudi travel
 *               pricing is written in Western digits, and mixing the two on one
 *               card (٣٥٠ ر.س. beside "5 أيام") looks broken.
 *   ca-gregory— the calendar `ar-SA` resolves to depends on the runtime's ICU
 *               data, and some environments pick Umm al-Qura. Departure dates,
 *               visa validity and check-in dates are all Gregorian, so it is
 *               pinned rather than left to the platform.
 */
const AR_NUMERIC = "ar-SA-u-nu-latn-ca-gregory";
const AR_CURRENCY = "ar-SA-u-nu-latn";

export function formatDate(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? AR_NUMERIC : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPrice(value: string | number, locale: Locale, currency = "SAR"): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale === "ar" ? AR_CURRENCY : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// API times arrive as "HH:MM:SS"; the seconds carry no meaning for a guest.
export function formatTime(value: string): string {
  return value.slice(0, 5);
}
