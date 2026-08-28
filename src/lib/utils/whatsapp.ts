import { siteConfig } from "@/config/site";

/** Builds a wa.me deep link with a pre-filled Arabic message. Pre-filling is
 *  what turns a WhatsApp tap into a qualified lead rather than an empty "hi". */
export function whatsappLink(message: string) {
  const number = siteConfig.contactPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
