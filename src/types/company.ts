export const SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "X",
  "TIKTOK",
  "SNAPCHAT",
  "YOUTUBE",
  "LINKEDIN",
  "WHATSAPP",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface Certificate {
  id: number;
  name_ar: string;
  name_en: string;
  issuer_ar: string;
  issuer_en: string;
  reference_number: string;
  /** Badge artwork. Null when the company has supplied the document but not
   *  the mark — the footer then shows a labelled credential instead. */
  image: string | null;
  /** The PDF or the issuing authority's verification page. "" means the badge
   *  is shown but is not clickable. */
  document: string;
  order: number;
}

export interface Branch {
  id: number;
  name_ar: string;
  name_en: string;
  /** Dialable: no spaces, for the tel: href. */
  phone: string;
  /** Readable. Blank falls back to `phone`. */
  phone_display: string;
  address_ar: string;
  address_en: string;
  order: number;
}

export interface SocialLink {
  id: number;
  platform: SocialPlatform;
  url: string;
  order: number;
}
