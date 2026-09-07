import type { ServiceType } from "@/types/inquiry";

/**
 * One entry in the contact form's "Service needed" list.
 *
 * Two sources merged by the API into one ordered list: the six types every
 * enquiry is filed under, and the services an editor has switched on for the
 * form. "Travel insurance" is the second kind — it is filed under OTHER, but
 * the visitor should be able to say it rather than picking Other and hoping
 * the message explains.
 */
export interface ContactFormService {
  kind: "TYPE" | "SERVICE";
  /** The bucket the enquiry is filed under, either way. */
  value: ServiceType;
  /** Set only on a SERVICE, and what the form posts back. */
  service_id: number | null;
  slug: string;
  label_ar: string;
  label_en: string;
  order: number;
}

/**
 * The value the `<select>` carries. A type and a service can share a `value` —
 * six services are all filed under OTHER — so the option has to say which one
 * it is as well as what it files under.
 */
export function choiceId(entry: ContactFormService): string {
  return entry.kind === "SERVICE" ? `SERVICE:${entry.service_id}` : `TYPE:${entry.value}`;
}
