import type { FlightDeal } from "@/types/flight";
import type { Hotel } from "@/types/hotel";
import type { Package } from "@/types/package";
import type { VisaType } from "@/types/visa";
import type { Cruise } from "@/types/cruise";

export const SEARCH_TABS = ["flights", "hotels", "packages", "visas", "cruises"] as const;

export type SearchTab = (typeof SEARCH_TABS)[number];

/** One short list per tab, fetched on the server so switching tabs costs
 *  nothing. Six each: enough to fill a rail, small enough to send all five. */
export interface SearchResultSets {
  flights: FlightDeal[];
  hotels: Hotel[];
  packages: Package[];
  visas: VisaType[];
  cruises: Cruise[];
}
