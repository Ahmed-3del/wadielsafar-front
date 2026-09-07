import { apiList } from "./client";
import type { InquiryServiceType } from "@/types/inquiry-service-type";

/** The services the contact form offers, in the order the panel arranged them. */
export function getInquiryServiceTypes() {
  return apiList<InquiryServiceType>("/inquiries/service-types/", { page_size: 50 });
}
