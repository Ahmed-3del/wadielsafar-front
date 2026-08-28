import { apiFetch, apiList } from "./client";
import type { Hotel, HotelAmenity } from "@/types/hotel";

export type HotelParams = {
  // destination filters by slug, matching apps/hotels/filters on the backend.
  destination?: string;
  star_rating?: number;
  star_rating_min?: number;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  page?: number;
};

export function getHotels(params?: HotelParams) {
  return apiList<Hotel>("/hotels/", params);
}

export function getHotelBySlug(slug: string) {
  return apiFetch<Hotel>(`/hotels/${slug}/`);
}

export function getHotelAmenities(params?: { page_size?: number }) {
  return apiList<HotelAmenity>("/hotels/amenities/", params);
}

// The `featured` action answers with a bare array, not the paginated envelope.
export function getFeaturedHotels(limit = 6) {
  return apiFetch<Hotel[]>("/hotels/featured/", { params: { limit } });
}
