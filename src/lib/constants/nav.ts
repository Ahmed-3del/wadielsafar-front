/*
 * The navigation the site falls back to.
 *
 * Editors own the real list — it lives in the database and is reordered from
 * the panel. This copy exists because navigation is the one thing that must
 * never disappear: if the API is unreachable, a header with no links is a
 * broken site, while a header showing last-known-good links is a site with
 * stale navigation. The second is recoverable and the first is not.
 *
 * Labels here come from the message files, since these are the routes the app
 * actually ships with.
 */
export type NavLabelKey =
  | "home"
  | "destinations"
  | "packages"
  | "visas"
  | "flights"
  | "hotels"
  | "cruises"
  | "corporate"
  | "offers"
  | "about"
  | "contact";

export interface NavItem {
  href: string;
  labelKey: NavLabelKey;
}

export const fallbackPrimaryNav: NavItem[] = [
  { href: "/", labelKey: "home" },
  { href: "/destinations", labelKey: "destinations" },
  { href: "/packages", labelKey: "packages" },
  { href: "/visas", labelKey: "visas" },
  { href: "/flights", labelKey: "flights" },
  { href: "/hotels", labelKey: "hotels" },
  { href: "/cruises", labelKey: "cruises" },
  { href: "/corporate", labelKey: "corporate" },
];

export const fallbackSecondaryNav: NavItem[] = [
  { href: "/offers", labelKey: "offers" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
];
