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


/**
 * Fallback for the add-on tiles under the search.
 *
 * These are the services the search tabs do NOT cover — the things a traveller
 * adds once the trip is settled. Shaped like an API row so the component can
 * take either without branching. Copy is English-only here because it is a
 * last resort: when the API answers, its own bilingual rows are used.
 */
export const FALLBACK_ADDON_SERVICES = [
  { slug: "car-rental", icon: "car", name_en: "Car Rental", name_ar: "تأجير السيارات" },
  { slug: "airport-transfers", icon: "transfer", name_en: "Airport Transfers", name_ar: "تنقلات المطار" },
  { slug: "international-licence", icon: "licence", name_en: "International Licence", name_ar: "الرخصة الدولية" },
  { slug: "travel-insurance", icon: "shield", name_en: "Travel Insurance", name_ar: "تأمين السفر" },
  { slug: "internet-packages", icon: "sim", name_en: "Internet Packages", name_ar: "باقات الاتصال والإنترنت" },
  { slug: "activities-tours", icon: "ticket", name_en: "Activities & Tours", name_ar: "حجز الأنشطة والجولات" },
  { slug: "instant-visa", icon: "passport", name_en: "Instant Visa", name_ar: "تأشيرة فورية" },
  { slug: "travel-consultation", icon: "headset", name_en: "Free Travel Consultation", name_ar: "استشارة سفر مجانية" },
].map((row, order) => ({
  ...row,
  id: -(order + 1),
  description_ar: "",
  description_en: "",
  image: null,
  // The fallback exists for an unreachable API, so it leads where every
  // service leads by default: the contact form.
  link: "",
  order,
  is_active: true,
}));
