export type HeroMediaType = "NONE" | "IMAGE" | "VIDEO";

// "home" is deliberately absent: the homepage's hero is the search band, not
// a page hero — nothing here ever fetches getPageHero("home").
export type PageKey =
  | "destinations"
  | "packages"
  | "visas"
  | "flights"
  | "hotels"
  | "cruises"
  | "offers"
  | "corporate"
  | "about"
  | "contact";

export interface PageHero {
  id: number;
  page_key: PageKey;
  media_type: HeroMediaType;
  image_url: string;
  video_url: string;
  poster_url: string;
  /** 0–100 scrim strength over the media, set per hero by an editor. */
  overlay_opacity: number;
  eyebrow_ar: string;
  eyebrow_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  is_active: boolean;
}
