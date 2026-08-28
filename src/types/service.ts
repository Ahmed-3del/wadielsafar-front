export interface Service {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  // Icon key (e.g. "plane", "hotel"), not a URL.
  icon: string;
  image: string | null;
  order: number;
  is_active: boolean;
}
