import { apiFetch, apiList } from "./client";
import type { Cruise, CruiseDetail } from "@/types/cruise";

export function getCruises(params?: {
  destination?: string;
  /** Free-text, matched against title and cruise line by the API's
   *  SearchFilter — this is what the homepage widget sends. */
  search?: string;
  /** ISO date — matches cruises sailing on or after it. */
  depart_after?: string;
  price_max?: number;
  nights_min?: number;
  page?: number;
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
