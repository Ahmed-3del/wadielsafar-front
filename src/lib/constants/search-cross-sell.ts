import type { SearchTab } from "@/types/search";
import type { ServiceType } from "@/types/inquiry";

/*
 * What the recommendations rail shows next to a given tab.
 *
 * Never the tab's own type: someone looking at flights has already been shown
 * the flights, and a second rail of them is the page repeating itself. The
 * pairs below are what the client's feedback asked for — a flight search
 * should still put packages and hotels in front of the reader.
 *
 * Shared between the main search results (for its own "see all") and the
 * recommendations rail (for both the cross list and its "see all"), so the
 * two cannot drift apart now that they can be positioned independently.
 */
export const CROSS_SELL: Record<SearchTab, SearchTab> = {
  flights: "packages",
  hotels: "packages",
  packages: "flights",
  visas: "packages",
  cruises: "packages",
};

export const SEE_ALL: Record<SearchTab, string> = {
  flights: "/flights",
  hotels: "/hotels",
  packages: "/packages",
  visas: "/visas",
  cruises: "/cruises",
};

/** Which contact-form bucket a tab's own "send us a request" fallback files
 *  under — see SearchResults' empty state. */
export const SERVICE_TYPE: Record<SearchTab, ServiceType> = {
  flights: "FLIGHT",
  hotels: "HOTEL",
  packages: "PACKAGE",
  visas: "VISA",
  cruises: "CRUISE",
};
