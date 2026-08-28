import type { ServiceType } from "./inquiry";

export type OfferStatus = "SCHEDULED" | "ACTIVE" | "EXPIRED";

export interface Offer {
  id: number;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  service_type: ServiceType;
  price_before: string | null;
  price_after: string | null;
  // Computed server-side from the price pair; null when either price is missing.
  discount_percentage: number | null;
  image: string | null;
  starts_at: string;
  ends_at: string;
  // Computed server-side from the validity window.
  status: OfferStatus;
  is_featured: boolean;
  is_active: boolean;
}
