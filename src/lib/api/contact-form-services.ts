import { apiFetch } from "./client";
import type { ContactFormService } from "@/types/contact-form-service";

/**
 * What the contact form offers. A plain array, not the paginated envelope —
 * it is a merged view rather than a table.
 */
export function getContactFormServices() {
  return apiFetch<ContactFormService[]>("/inquiries/form-services/");
}
