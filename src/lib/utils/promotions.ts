import type { Promotion } from "@/types/promotion";

/*
 * The offers still running, and the instant they were judged against.
 *
 * The clock reading is returned rather than taken again downstream: the cards
 * and the countdown they render must agree on "now", or a card can survive the
 * filter and then render a timer that is already at zero.
 *
 * It lives outside the component because reading the clock is exactly the kind
 * of impurity a render is not allowed — see react-hooks/purity.
 */
export function livePromotions(promotions: Promotion[]): { live: Promotion[]; now: number } {
  const now = Date.now();
  const live = promotions.filter(
    (promotion) => !promotion.ends_at || new Date(promotion.ends_at).getTime() > now,
  );
  return { live, now };
}
