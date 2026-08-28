import type { Destination } from "./destination";

export interface HotelAmenity {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
}

export interface Hotel {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  destination: Destination;
  star_rating: number;
  address_ar: string;
  address_en: string;
  description_ar: string;
  description_en: string;
  amenities: HotelAmenity[];
  price_per_night_from: string;
  currency: string;
  cover_image: string | null;
  // "HH:MM:SS"
  check_in_time: string | null;
  check_out_time: string | null;
  is_featured: boolean;
  is_active: boolean;
}
