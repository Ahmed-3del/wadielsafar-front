import type { InquiryField } from "@/types/inquiry-field";

export interface SelectOption {
  /** What is stored on the enquiry, and what an agent reads: the option in the
   *  visitor's own language. */
  value: string;
  /** The same option in English, whatever the visitor is reading. Rules like
   *  "show the return date on a round trip" are written against this, so one
   *  rule covers both languages. */
  match: string;
}

export interface RequestFieldDef {
  name: string;
  /** Already in the reader's language — these come from rows an agent edits,
   *  not from a message catalogue. */
  label: string;
  placeholder?: string;
  // "checkbox" renders a multi-select group. Its value reaches the API as a
  // joined string, not an array: the inquiry `details` field accepts flat
  // scalars only.
  //
  // "stepper" and "segmented" are selects by another name — they carry the
  // same string values, but a count is faster to set with two buttons than a
  // dropdown, and a short option set is faster to read laid out than rolled up.
  //
  // "airport" and "city" are the same searchable picker over the airport
  // catalogue; "airport" keeps the IATA code in the answer because a flight
  // question needs it, "city" drops it because a hotel question does not.
  // Both still accept a typed answer: a gap in reference data must not cost an
  // enquiry.
  type:
    | "text"
    | "date"
    | "select"
    | "textarea"
    | "checkbox"
    | "stepper"
    | "segmented"
    | "airport"
    | "city"
    | "number";
  /** Bounds for a stepper. Its value stays a string, like every other field. */
  min?: number;
  max?: number;
  /** Date fields: refuse anything before today. A trip that starts yesterday
   *  is a typo, and it reaches an agent as a booking nobody can fulfil. */
  notPast?: boolean;
  /** Date fields: refuse anything earlier than this other field's value. A
   *  return cannot precede its departure, nor a check-out its check-in. */
  notBefore?: string;
  required?: boolean;
  options?: SelectOption[];
  /** Full width on the two-column desktop grid. */
  wide?: boolean;
  /** Only render while another field holds this answer, compared in English. */
  showWhen?: { field: string; equals: string };
  /** Consecutive fields sharing this heading become one titled block. */
  group?: string;
}

/* How a row's type maps onto a control. The five plain types mean the same
 * thing on the contact form and the service pages; the richer ones are what
 * the service pages add. */
const TYPES: Record<InquiryField["field_type"], RequestFieldDef["type"]> = {
  TEXT: "text",
  TEXTAREA: "textarea",
  NUMBER: "number",
  DATE: "date",
  SELECT: "select",
  STEPPER: "stepper",
  SEGMENTED: "segmented",
  CHECKBOX: "checkbox",
  AIRPORT: "airport",
  CITY: "city",
};

/*
 * Rows from the panel, as the form renderer wants them.
 *
 * These definitions used to be a table in this file, which meant changing a
 * question was a deployment. The labels are resolved here, once, so the
 * renderer never has to know that a question is a row rather than a constant.
 */
export function toRequestFields(rows: InquiryField[], isArabic: boolean): RequestFieldDef[] {
  return [...rows]
    .sort((a, b) => a.order - b.order)
    .map((row) => ({
      name: row.key,
      label: isArabic ? row.label_ar : row.label_en,
      placeholder: (isArabic ? row.placeholder_ar : row.placeholder_en) || undefined,
      type: TYPES[row.field_type] ?? "text",
      min: row.min_value ?? undefined,
      max: row.max_value ?? undefined,
      notPast: row.not_past || undefined,
      notBefore: row.not_before || undefined,
      required: row.is_required || undefined,
      wide: row.is_wide || undefined,
      options:
        row.options.length > 0
          ? row.options.map((option) => ({
              value: isArabic ? option.ar : option.en,
              match: option.en,
            }))
          : undefined,
      showWhen: row.show_when_key
        ? { field: row.show_when_key, equals: row.show_when_value }
        : undefined,
      group: (isArabic ? row.group_ar : row.group_en) || undefined,
    }));
}
