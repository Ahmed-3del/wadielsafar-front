/** The single announcement strip pinned across the top of every page. Null
 *  from the API means it is switched off, and nothing renders at all. */
export interface PromoBar {
  headline_ar: string;
  headline_en: string;
  /** Shown in a chip of its own. Empty hides the chip entirely — not every
   *  offer needs a code to quote. */
  code: string;
  cta_label_ar: string;
  cta_label_en: string;
  /** A path on this site. Empty falls back to the contact form. */
  link: string;
}
