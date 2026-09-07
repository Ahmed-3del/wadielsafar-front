import { apiList } from "./client";
import type { InquiryField } from "@/types/inquiry-field";

/**
 * Every question the contact form can ask, for every service.
 *
 * Fetched once rather than per service: the whole set is a few dozen short
 * rows, and switching the service picker has to be instant — a request on
 * every change would leave the form blank while it loaded.
 */
export function getInquiryFields(params?: { service_type?: string }) {
  return apiList<InquiryField>("/inquiries/fields/", { page_size: 200, ...params });
}
