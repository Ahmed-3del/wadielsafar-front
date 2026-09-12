"use server";

import { getCruises } from "@/lib/api/cruises";
import type { Cruise } from "@/types/cruise";

/*
 * Lets the homepage's cruises tab show real, matching sailings the instant a
 * country, a port or a departure date is chosen — see search-visas.ts for why
 * this is a Server Action rather than a client-side fetch straight to the API.
 */
export async function searchCruisesAction(
  country: string,
  port: string,
  departAfter: string,
): Promise<Cruise[]> {
  if (!country && !port && !departAfter) return [];
  const response = await getCruises({
    country: country || undefined,
    port: port || undefined,
    depart_after: departAfter || undefined,
    page_size: 12,
  });
  return response.results;
}
