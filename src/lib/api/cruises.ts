import { apiFetch, apiList } from "./client";
import type { Cruise, CruiseDetail, CruisePort } from "@/types/cruise";

export function getCruises(params?: {
  destination?: string;
  /** Free-text, matched against title and cruise line by the API's
   *  SearchFilter — this is what the homepage widget sends. */
  search?: string;
  /** ISO date — matches cruises sailing on or after it. */
  depart_after?: string;
  /** ISO 3166-1 alpha-2 of the departure country. */
  country?: string;
  /** Departure port code. */
  port?: string;
  price_max?: number;
  nights_min?: number;
  page?: number;
  page_size?: number;
}) {
  return apiList<Cruise>("/cruises/", params);
}

export function getCruiseBySlug(slug: string) {
  return apiFetch<CruiseDetail>(`/cruises/${slug}/`);
}

// The `featured` action answers with a bare array, not the paginated envelope.
export function getFeaturedCruises(limit = 6) {
  return apiFetch<Cruise[]>("/cruises/featured/", { params: { limit } });
}

/** Every port, for the cruise search's country and port pickers. It is about a
 *  hundred rows and it barely changes, so one request beats a round trip per
 *  keystroke — and the country list is derived from it rather than fetched
 *  separately, which is what keeps the two in step. */
export function getCruisePorts(pageSize = 300) {
  return apiList<CruisePort>("/cruises/ports/", { page_size: pageSize });
}
