import type { Destination } from "./destination";

/** A port ships sail from. Reference data, shared by the homepage's cruise
 *  search and the panel's cruise form. */
export interface CruisePort {
  id: number;
  /** Natural key, and what the search sends. */
  code: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  country_ar: string;
  country_en: string;
  /** ISO 3166-1 alpha-2. Groups the ports by country and draws the flag. */
  country_code: string;
  is_popular: boolean;
  order: number;
}

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
  /** The port as a record. Null on a sailing nobody has linked yet, which is
   *  why the two text fields below still carry what the card prints. */
  departure_port: CruisePort | null;
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
