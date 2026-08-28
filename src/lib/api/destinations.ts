import { apiFetch, apiList } from "./client";
import type { Destination } from "@/types/destination";
import type { PaginatedResponse } from "@/types/api";

export function getDestinations(params?: { country?: string; page_size?: number }) {
  return apiList<Destination>("/destinations/", params);
}

export function getDestinationBySlug(slug: string) {
  return apiFetch<Destination>(`/destinations/${slug}/`);
}

// No dedicated "popular" filter in the documented contract; the homepage
// section shows the first page of the default (backend-ordered) list.
export function getPopularDestinations(): Promise<PaginatedResponse<Destination>> {
  return apiList<Destination>("/destinations/", { page_size: 6 });
}
