import type { Package } from "@/types/package";

export type NightsBand = "any" | "short" | "medium" | "long";

export const NIGHTS_BANDS: NightsBand[] = ["any", "short", "medium", "long"];

export interface BudgetQuery {
  /** Maximum price per person, in SAR. */
  budget: number;
  nights: NightsBand;
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
