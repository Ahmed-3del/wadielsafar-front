import { apiFetch, apiList } from "./client";
import type { VisaCountry, VisaType } from "@/types/visa";

export function getVisaTypes(params?: {
  country?: string;
  purpose?: string;
  page?: number;
  page_size?: number;
}) {
  return apiList<VisaType>("/visas/", params);
}

/** The homepage's own visa rail. */
export function getFeaturedVisaTypes() {
  return apiList<VisaType>("/visas/", { is_featured: true, page_size: 8 });
}

export function getVisaTypeById(id: number | string) {
  return apiFetch<VisaType>(`/visas/${id}/`);
}

export function getVisaCountries(params?: { page_size?: number }) {
  return apiList<VisaCountry>("/visas/countries/", params);
}
