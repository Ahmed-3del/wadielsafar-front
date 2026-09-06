export const INQUIRY_FIELD_TYPES = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT"] as const;

export type InquiryFieldType = (typeof INQUIRY_FIELD_TYPES)[number];

/**
 * One extra question the contact form asks for a given service.
 *
 * These are rows in the panel, not code: what an agent needs to answer a
 * cruise enquiry differs from a visa one, and it changes without a deploy.
 */
export interface InquiryField {
  id: number;
  service_type: string;
  /** The key the answer is filed under in the inquiry's `details`. */
  key: string;
  label_ar: string;
  label_en: string;
  field_type: InquiryFieldType;
  placeholder_ar: string;
  placeholder_en: string;
  /** Zipped by the API, so the two languages cannot fall out of step here. */
  options: { ar: string; en: string }[];
  is_required: boolean;
  order: number;
}
