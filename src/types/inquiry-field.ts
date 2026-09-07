export const INQUIRY_FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "STEPPER",
  "SEGMENTED",
  "CHECKBOX",
  "AIRPORT",
  "CITY",
] as const;

export type InquiryFieldType = (typeof INQUIRY_FIELD_TYPES)[number];

/**
 * One question the website asks for a given service.
 *
 * These are rows in the panel, not code: what an agent needs to answer a
 * cruise enquiry differs from a visa one, and it changes without a deploy.
 * The same rows drive the contact form and the service pages, so the two
 * cannot drift apart.
 */
export interface InquiryField {
  id: number;
  /** The base service type this belongs to, when it belongs to a type rather
   *  than to one particular service. */
  service_type: string;
  /** The service from the Services screen this belongs to, when it is one
   *  service's own question. Null for a type's questions. */
  service: number | null;
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
  /** Bounds for a count. */
  min_value: number | null;
  max_value: number | null;
  /** Dates: refuse anything before today. */
  not_past: boolean;
  /** Dates: another question's key, which this one cannot precede. */
  not_before: string;
  /** Show this only while another question holds this answer. Matched against
   *  the English option, so one rule covers both languages. */
  show_when_key: string;
  show_when_value: string;
  is_wide: boolean;
  /** Consecutive questions sharing a heading become one titled block. */
  group_ar: string;
  group_en: string;
  order: number;
}
