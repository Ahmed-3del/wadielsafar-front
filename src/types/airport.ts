export interface Airport {
  id: number;
  iata_code: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  country_ar: string;
  country_en: string;
  /** ISO 3166-1 alpha-2, or "" when the catalogue has no code for it. */
  country_code: string;
  is_popular: boolean;
}
