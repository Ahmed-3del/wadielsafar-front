import { apiList } from "./client";
import type { Service } from "@/types/service";

// Public reads already exclude inactive rows; ordering is ("order", "name_en").
export function getServices(params?: { page_size?: number }) {
  return apiList<Service>("/services/", params);
}
