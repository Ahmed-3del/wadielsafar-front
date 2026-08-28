import { apiFetch, apiList } from "./client";
import type { Airport } from "@/types/airport";
import type { PaginatedResponse } from "@/types/api";

/**
 * Ranked airport lookup. The backend does the ranking — an exact IATA code
 * first, then a city whose name starts with the term — so the client must not
 * re-sort what comes back.
 *
 * Takes an AbortSignal because the picker fires this while someone is still
 * typing: without it the answer to "Riy" can land after the answer to "Riyad".
 */
export function searchAirports(
  search: string,
  pageSize = 8,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Airport>> {
  return apiFetch<PaginatedResponse<Airport>>("/airports/", {
    params: { search, page_size: pageSize },
    signal,
  });
}

/** What the picker offers before anyone has typed: Saudi departure points and
 *  the destinations travellers here ask for most. */
export function getPopularAirports(pageSize = 12) {
  return apiList<Airport>("/airports/", { is_popular: true, page_size: pageSize });
}
