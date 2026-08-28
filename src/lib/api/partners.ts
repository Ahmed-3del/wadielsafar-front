import { apiList } from "./client";
import type { Partner } from "@/types/partner";

export function getPartners(params?: { page_size?: number }) {
  return apiList<Partner>("/partners/", params);
}
