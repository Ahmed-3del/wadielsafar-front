import { apiFetch } from "./client";
import type { NavItemRecord } from "@/types/nav-item";

/** Unpaginated on the API side: the header wants the whole set in one request. */
export function getNavItems() {
  return apiFetch<NavItemRecord[]>("/navigation/");
}
