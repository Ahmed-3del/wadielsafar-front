import type { Destination } from "./destination";

export interface PackageCategory {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
}

export interface Package {
  id: number;
  title_ar: string;
  title_en: string;
  slug: string;
  category: PackageCategory;
  destination: Destination;
  description_ar: string;
  description_en: string;
  duration_days: number;
  included_services_ar: string;
  included_services_en: string;
  price_from: string;
  cover_image: string | null;
  is_featured: boolean;
}

export interface PackageItineraryDay {
  id: number;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
}

/** The detail endpoint nests the البرنامج اليومي; list responses do not. */
export interface PackageDetail extends Package {
  itinerary: PackageItineraryDay[];
}
