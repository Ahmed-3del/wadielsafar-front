import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  /*
   * Arabic is the site, not a preference. Left on, next-intl reads the
   * visitor's accept-language header and sends anyone with an English browser
   * to /en — which meant a Saudi traveller on an English-configured phone
   * never saw the Arabic site at all, and the "main" language depended on a
   * setting the company has no control over.
   *
   * Switching to English still works and still sticks: localePrefix is
   * "always", so once a visitor is on /en every link keeps the prefix. Only a
   * bare "/" is opinionated, and it opens in Arabic.
   */
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
