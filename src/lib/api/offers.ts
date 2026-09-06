import { apiFetch, apiList } from "./client";
import type { Offer, OfferStatus } from "@/types/offer";
import type { ServiceType } from "@/types/inquiry";

export type OfferParams = {
  service_type?: ServiceType;
  // status is computed from the validity window, not a stored column.
  status?: OfferStatus;
  is_featured?: boolean;
  page?: number;
  page_size?: number;
};

export function getOffers(params?: OfferParams) {
  return apiList<Offer>("/offers/", params);
}

export function getOfferBySlug(slug: string) {
  return apiFetch<Offer>(`/offers/${slug}/`);
}

// The `active` action answers with a bare array of offers whose window covers
// today, not the paginated envelope.
export function getActiveOffers(limit = 4) {
  return apiFetch<Offer[]>("/offers/active/", { params: { limit } });
}
