import type { ServiceType } from "@/types/inquiry";

/**
 * The values an enquiry can be filed under. Mirrors the backend's
 * service_type choices verbatim (see InquiryPayload).
 *
 * This is the fixed half: it is what the schema validates against, and what
 * the form falls back to when the API is unreachable. The list a visitor sees
 * — the wording, the order, which entries are offered at all — comes from the
 * panel over /inquiries/service-types/, not from here.
 */
export const SERVICE_TYPES: ServiceType[] = [
  "FLIGHT",
  "HOTEL",
  "PACKAGE",
  "VISA",
  "CRUISE",
  "CORPORATE",
  "OTHER",
];
