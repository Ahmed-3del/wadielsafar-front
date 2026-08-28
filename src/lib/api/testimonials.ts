import { apiList } from "./client";
import type { Testimonial } from "@/types/testimonial";

// The public list already returns approved + visible rows only.
export function getTestimonials(params?: { page_size?: number; page?: number }) {
  return apiList<Testimonial>("/testimonials/", params);
}
