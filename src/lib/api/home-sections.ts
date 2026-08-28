import { apiList } from "./client";
import type { HomeSection } from "@/types/home-section";

/** The homepage's running order. Well under a page of rows, so one request. */
export function getHomeSections() {
  return apiList<HomeSection>("/pages/home-sections/", { page_size: 30 });
}
