import type { ServiceType } from "@/types/inquiry";

/**
 * One entry in the contact form's "what do you need?" list.
 *
 * The value is fixed — it is the column every enquiry is filed under, and the
 * panel filters by it. What the panel owns is what a visitor sees: the wording,
 * the order, and whether the entry is offered at all. So the list on the form
 * is a fetch, not a table in this repository.
 */
export interface InquiryServiceType {
  id: number;
  value: ServiceType;
  label_ar: string;
  label_en: string;
  order: number;
  is_active: boolean;
}
