import { safeArray, safeResults } from "./client";
import { getFeaturedFlightDeals } from "./flights";
import { getFeaturedHotels } from "./hotels";
import { getPackages } from "./packages";
import { getVisaTypes } from "./visas";
import { getFeaturedCruises } from "./cruises";
import type { SearchResultSets } from "@/types/search";

/**
 * Everything the homepage search can show, in one server round.
 *
 * Fetched together rather than per tab: the five lists are six rows each, and
 * a tab that has to wait for a request is a tab that feels broken. Each list
 * degrades to empty on its own, so one unreachable endpoint costs one rail
 * rather than the page.
 */
export async function getSearchResults(): Promise<SearchResultSets> {
  const [flights, hotels, packages, visas, cruises] = await Promise.all([
    safeArray(getFeaturedFlightDeals(6)),
    safeArray(getFeaturedHotels(6)),
    safeResults(getPackages({ page_size: 6 })),
    safeResults(getVisaTypes({ page: 1 })),
    safeArray(getFeaturedCruises(6)),
  ]);

  return { flights, hotels, packages, visas: visas.slice(0, 6), cruises };
}
