"use server";

import { getHotels } from "@/lib/api/hotels";
import type { Hotel } from "@/types/hotel";

/*
 * Lets the homepage's hotels tab show real, matching hotels the instant a
 * destination is chosen — see search-visas.ts for why this is a Server
 * Action rather than a client-side fetch straight to the API.
 *
 * Check-in and check-out are not filterable server-side (no such field on
 * HotelFilter), so this only ever narrows by destination — the one field the
 * catalogue can actually answer.
 */
export async function searchHotelsAction(destination: string): Promise<Hotel[]> {
  if (!destination) return [];
  const response = await getHotels({ destination, page_size: 12 });
  return response.results;
}
