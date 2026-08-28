import type { Locale } from "@/i18n/routing";
import type { Offer } from "@/types/offer";
import { formatPrice } from "./format-date";

export interface OfferPricing {
  /** Formatted price the customer pays, or null when the offer quotes no price. */
  current: string | null;
  /** Formatted pre-discount price, only when it is genuinely above `current`. */
  strikethrough: string | null;
  /** Server-computed whole-percent saving, only when it represents a real one. */
  discountPercentage: number | null;
}

function parseAmount(value: string | null): number | null {
  if (value === null) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

/**
 * Offers may carry both prices, only one, or neither, and the discount is
 * computed upstream. This resolves what the card is actually allowed to show:
 * a struck-through price is misleading unless it sits above the real one.
 */
export function getOfferPricing(offer: Offer, locale: Locale): OfferPricing {
  const before = parseAmount(offer.price_before);
  const after = parseAmount(offer.price_after);
  const current = after ?? before;
  const discount = offer.discount_percentage;

  return {
    current: current === null ? null : formatPrice(current, locale),
    strikethrough:
      before !== null && after !== null && before > after ? formatPrice(before, locale) : null,
    discountPercentage: discount !== null && discount > 0 ? discount : null,
  };
}
