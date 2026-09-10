export const HOME_SECTION_KEYS = [
  "RECOMMENDATIONS",
  "LOYALTY",
  "SERVICES",
  "SAVINGS",
  "EXPLORER",
  "DESTINATIONS",
  "PACKAGES",
  "OFFERS",
  "VISAS",
  "CRUISES",
  "TRUST",
  "PARTNERS",
  "TESTIMONIALS",
  "CTA",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export interface HomeSection {
  id: number;
  key: HomeSectionKey;
  /** Human name, supplied by the API so the panel and the site agree. */
  label: string;
  order: number;
  is_active: boolean;
}
