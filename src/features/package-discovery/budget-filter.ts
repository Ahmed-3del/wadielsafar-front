import type { Package } from "@/types/package";

export type NightsBand = "any" | "short" | "medium" | "long";

export const NIGHTS_BANDS: NightsBand[] = ["any", "short", "medium", "long"];

/** A package category slug, or "any" for no restriction. */
export type TripType = string;

export const ANY_TRIP_TYPE = "any";

export interface TripTypeOption {
  slug: string;
  name_ar: string;
  name_en: string;
}

export interface BudgetQuery {
  /** Maximum price per person, in SAR. */
  budget: number;
  nights: NightsBand;
  tripType: TripType;
}

/*
 * The order the client asked for, for the categories they named. Anything an
 * admin adds later still appears — after these, in catalogue order — so the
 * filter never silently hides a category that exists.
 */
const TRIP_TYPE_ORDER = ["family", "honeymoon", "religious", "adventure"];

/*
 * The trip types are read off the catalogue rather than hard-coded, so a chip
 * can never offer a filter that matches nothing, and the labels are the ones
 * the admin set in the panel rather than a second copy kept in the front end.
 */
export function tripTypesOf(packages: Package[]): TripTypeOption[] {
  const seen = new Map<string, TripTypeOption>();
  for (const pkg of packages) {
    const category = pkg.category;
    if (!category?.slug || seen.has(category.slug)) continue;
    seen.set(category.slug, {
      slug: category.slug,
      name_ar: category.name_ar,
      name_en: category.name_en,
    });
  }

  const rank = (slug: string) => {
    const index = TRIP_TYPE_ORDER.indexOf(slug);
    return index === -1 ? TRIP_TYPE_ORDER.length : index;
  };

  return [...seen.values()].sort((a, b) => rank(a.slug) - rank(b.slug));
}

/** Trips are sold as days; nights is one fewer for a return itinerary. */
export function nightsOf(pkg: Pick<Package, "duration_days">): number {
  return Math.max(pkg.duration_days - 1, 0);
}

function withinBand(nights: number, band: NightsBand): boolean {
  switch (band) {
    case "short":
      return nights <= 4;
    case "medium":
      return nights >= 5 && nights <= 7;
    case "long":
      return nights >= 8;
    default:
      return true;
  }
}

/*
 * Pure, so it can be tested without a browser and so the panel stays a matter
 * of rendering rather than of deciding.
 *
 * price_from arrives as a decimal string from the API; compared as text,
 * "9500" would sort above "12000".
 */
export function filterByBudget(packages: Package[], query: BudgetQuery): Package[] {
  return packages
    .filter((pkg) => Number(pkg.price_from) <= query.budget)
    .filter((pkg) => withinBand(nightsOf(pkg), query.nights))
    .filter((pkg) => query.tripType === ANY_TRIP_TYPE || pkg.category?.slug === query.tripType)
    .sort((a, b) => Number(a.price_from) - Number(b.price_from));
}

/** Slider bounds taken from the catalogue and rounded outward, so the track
 *  spans exactly what is actually on sale. */
export function budgetBounds(packages: Package[], step = 500): { min: number; max: number } {
  const prices = packages.map((pkg) => Number(pkg.price_from)).filter((n) => Number.isFinite(n));
  if (prices.length === 0) return { min: 0, max: step };

  const min = Math.floor(Math.min(...prices) / step) * step;
  const max = Math.ceil(Math.max(...prices) / step) * step;
  // A catalogue at a single price point would give a zero-length track.
  return { min, max: max === min ? min + step : max };
}

/*
 * Maps a budget onto the planner's bands, so the explorer can hand over what it
 * already knows when nothing matches.
 *
 * The input is a ceiling — "show me trips up to X" — so it takes the band that
 * *ends* at or above it rather than the one that contains it. A maximum of
 * 10,000 is "5,000 to 10,000", not "10,000 to 20,000": overstating it sends the
 * agent off to quote trips the traveller has already said they cannot afford.
 */
export function budgetBandFor(budget: number): string {
  if (budget <= 5000) return "under5k";
  if (budget <= 10000) return "5to10k";
  if (budget <= 20000) return "10to20k";
  return "over20k";
}
