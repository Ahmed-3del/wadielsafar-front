import { apiFetch } from "./client";
import { fetchDetail } from "./fetch-detail";
import type { PageHero, PageKey } from "@/types/page-hero";

/** Returns null when no hero is configured for the page, which is the normal
 *  case — the site then falls back to its own brand gradient and copy. */
export function getPageHero(pageKey: PageKey) {
  return fetchDetail(apiFetch<PageHero>(`/pages/heroes/${pageKey}/`));
}
