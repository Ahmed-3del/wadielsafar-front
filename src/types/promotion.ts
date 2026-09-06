export const PROMOTION_ICONS = ["TAG", "CLOCK", "GIFT"] as const;

export type PromotionIcon = (typeof PROMOTION_ICONS)[number];

/** One "ways to save" card. Every figure on it — the percentage, the code, the
 *  deadline — is content the company edits, never a constant in the site. */
export interface Promotion {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  /** The headline figure, e.g. "15%". Blank on cards that lead with a timer. */
  badge_ar: string;
  badge_en: string;
  /** A code to quote. Blank when the offer needs none. */
  code: string;
  /** ISO instant. Null means no announced end, and the card shows no timer. */
  ends_at: string | null;
  icon: PromotionIcon;
  order: number;
}
