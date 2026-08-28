import { apiFetch, apiList } from "./client";
import type { Package, PackageDetail } from "@/types/package";

// category/destination filter by slug (?category=<slug>, ?destination=<slug>),
// matching apps/packages/filters/package_filter.py on the backend.
export function getPackages(params?: {
  category?: string;
  destination?: string;
  /** Both map to price_from on the API (gte / lte). */
  price_min?: number;
  price_max?: number;
  page?: number;
  page_size?: number;
}) {
  return apiList<Package>("/packages/", params);
}

export function getPackageBySlug(slug: string) {
  return apiFetch<PackageDetail>(`/packages/${slug}/`);
}

export function getFeaturedPackages() {
  return apiList<Package>("/packages/", { is_featured: true, page_size: 6 });
}
