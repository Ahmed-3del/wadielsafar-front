export type ServiceLinkKey =
  | "flights"
  | "hotels"
  | "packages"
  | "visas"
  | "cruises"
  | "corporate";

export interface ServiceLink {
  key: ServiceLinkKey;
  href: string;
}

/**
 * Documented fallback for the homepage grid. That grid is the site's primary
 * navigation into every service line, so an empty or unreachable /services/
 * response must still render a complete set of entry points. Copy resolves
 * against the "Services" namespace in messages/{locale}.json.
 */
export const FALLBACK_SERVICES: ServiceLink[] = [
  { key: "flights", href: "/flights" },
  { key: "hotels", href: "/hotels" },
  { key: "packages", href: "/packages" },
  { key: "visas", href: "/visas" },
  { key: "cruises", href: "/cruises" },
  { key: "corporate", href: "/corporate" },
];

// Matched as stems, so editorial slugs like "flight-booking" or
// "umrah-packages" still land on the right section route.
const SLUG_STEMS: ReadonlyArray<readonly [string, string]> = [
  ["flight", "/flights"],
  ["hotel", "/hotels"],
  ["package", "/packages"],
  ["visa", "/visas"],
  ["cruise", "/cruises"],
  ["corporate", "/corporate"],
];

export function resolveServiceHref(slug: string): string {
  const normalized = slug.toLowerCase();
  const match = SLUG_STEMS.find(([stem]) => normalized.includes(stem));
  // A service line with no section route of its own still needs somewhere to
  // send the visitor; the inquiry form handles anything bespoke.
  return match ? match[1] : "/contact";
}
