export type NavGroup = "PRIMARY" | "SECONDARY";

export interface NavItemRecord {
  id: number;
  label_ar: string;
  label_en: string;
  /** Site-relative and locale-less; the Link adds /ar or /en. */
  href: string;
  group: NavGroup;
  order: number;
}

/** What the components actually render, once a locale has been picked. */
export interface ResolvedNavItem {
  href: string;
  label: string;
}
