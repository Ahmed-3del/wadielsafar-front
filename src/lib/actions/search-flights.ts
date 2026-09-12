"use server";

import { getFlightDeals } from "@/lib/api/flights";
import type { FlightDeal } from "@/types/flight";

/*
 * Lets the homepage's flights tab show real, matching deals the instant a
 * departure or arrival airport is chosen — see search-visas.ts for why this
 * is a Server Action rather than a client-side fetch straight to the API.
 *
 * Dates are not filterable server-side (no such field on FlightDealFilter),
 * so this only ever narrows by route.
 */
export async function searchFlightsAction(
  originCode: string,
  destinationCode: string,
): Promise<FlightDeal[]> {
  if (!originCode && !destinationCode) return [];
  const response = await getFlightDeals({
    origin_airport_code: originCode || undefined,
    destination_airport_code: destinationCode || undefined,
    page_size: 12,
  });
  return response.results;
}
