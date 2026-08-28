import { apiFetch, apiList } from "./client";
import type { VisaCountry, VisaType } from "@/types/visa";

export function getVisaTypes(params?: { country?: string; page?: number }) {
  return apiList<VisaType>("/visas/", params);
}

export function getVisaTypeById(id: number | string) {
  return apiFetch<VisaType>(`/visas/${id}/`);
}

export function getVisaCountries(params?: { page_size?: number }) {
  return apiList<VisaCountry>("/visas/countries/", params);
}
