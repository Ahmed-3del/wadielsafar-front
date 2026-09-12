import { apiFetch, apiList } from "./client";
import type { CabinClass, FlightDeal, TripType } from "@/types/flight";

export type FlightDealParams = {
  trip_type?: TripType;
  cabin_class?: CabinClass;
  origin_airport_code?: string;
  destination_airport_code?: string;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  page?: number;
  page_size?: number;
};

export function getFlightDeals(params?: FlightDealParams) {
  return apiList<FlightDeal>("/flights/", params);
}

export function getFlightDealBySlug(slug: string) {
  return apiFetch<FlightDeal>(`/flights/${slug}/`);
}

// The `featured` action answers with a bare array, not the paginated envelope.
export function getFeaturedFlightDeals(limit = 6) {
  return apiFetch<FlightDeal[]>("/flights/featured/", { params: { limit } });
}
