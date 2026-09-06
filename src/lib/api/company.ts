import { apiList } from "./client";
import type { Branch, Certificate, SocialLink } from "@/types/company";
import type { Promotion } from "@/types/promotion";

/** Footer content the company edits from the panel: what it can prove, where
 *  it answers the phone, and where it posts. */
export function getCertificates() {
  return apiList<Certificate>("/company/certificates/", { page_size: 20 });
}

export function getBranches() {
  return apiList<Branch>("/company/branches/", { page_size: 30 });
}

export function getSocialLinks() {
  return apiList<SocialLink>("/company/social-links/", { page_size: 20 });
}

/** The homepage's "ways to save" cards. */
export function getPromotions() {
  return apiList<Promotion>("/company/promotions/", { page_size: 10 });
}
