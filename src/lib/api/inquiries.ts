import { apiFetch } from "./client";
import type { Inquiry, InquiryPayload } from "@/types/inquiry";

export function createInquiry(payload: InquiryPayload) {
  return apiFetch<Inquiry>("/inquiries/", {
    method: "POST",
    body: payload,
  });
}
