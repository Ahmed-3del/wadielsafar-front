import type { Destination } from "./destination";

export interface CruiseItineraryStop {
  id: number;
  day_number: number;
  port_ar: string;
  port_en: string;
  description_ar: string;
  description_en: string;
}

export interface Cruise {
  id: number;
  title_ar: string;
  title_en: string;
  slug: string;
  cruise_line_ar: string;
  cruise_line_en: string;
  destination: Destination | null;
  departure_port_ar: string;
  departure_port_en: string;
  description_ar: string;
  description_en: string;
  /** Sail date. Null until the season's dates are confirmed. */
  departure_date: string | null;
  /** Cruises are sold in nights; days are derived for display. */
  duration_nights: number;
  price_from: string;
  currency: string;
  cover_image: string | null;
  included_services_ar: string;
  included_services_en: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface CruiseDetail extends Cruise {
  itinerary: CruiseItineraryStop[];
}
