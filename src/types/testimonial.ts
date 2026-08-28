import type { ServiceType } from "./inquiry";

export interface Testimonial {
  id: number;
  customer_name: string;
  customer_title_ar: string;
  customer_title_en: string;
  content_ar: string;
  content_en: string;
  rating: number;
  avatar_image: string | null;
  service_type: ServiceType | null;
  is_approved: boolean;
  is_visible: boolean;
  order: number;
}
