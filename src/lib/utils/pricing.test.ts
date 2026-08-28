import { describe, expect, it } from "vitest";
import { getOfferPricing } from "./pricing";
import type { Offer } from "@/types/offer";

function makeOffer(overrides: Partial<Offer>): Offer {
  return {
    id: 1,
    title_ar: "عرض",
    title_en: "Offer",
    slug: "offer",
    description_ar: "",
    description_en: "",
    service_type: "PACKAGE",
    price_before: null,
    price_after: null,
    discount_percentage: null,
    image: null,
    starts_at: "2026-08-01",
    ends_at: "2026-09-01",
    status: "ACTIVE",
    is_featured: false,
    is_active: true,
    ...overrides,
  };
}

describe("getOfferPricing", () => {
  it("shows the discounted price with the original struck through", () => {
    const pricing = getOfferPricing(
      makeOffer({ price_before: "4000.00", price_after: "2990.00", discount_percentage: 25 }),
      "en",
    );

    expect(pricing.current).toContain("2,990");
    expect(pricing.strikethrough).toContain("4,000");
    expect(pricing.discountPercentage).toBe(25);
  });

  it("omits the struck-through price when only one price is quoted", () => {
    const pricing = getOfferPricing(makeOffer({ price_after: "1200.00" }), "en");

    expect(pricing.current).toContain("1,200");
    expect(pricing.strikethrough).toBeNull();
    expect(pricing.discountPercentage).toBeNull();
  });

  it("falls back to price_before when there is no discounted price", () => {
    const pricing = getOfferPricing(makeOffer({ price_before: "1500.00" }), "en");

    expect(pricing.current).toContain("1,500");
    expect(pricing.strikethrough).toBeNull();
  });

  it("never strikes through a price that is not above the one charged", () => {
    const pricing = getOfferPricing(
      makeOffer({ price_before: "1200.00", price_after: "1200.00", discount_percentage: 0 }),
      "en",
    );

    expect(pricing.strikethrough).toBeNull();
    expect(pricing.discountPercentage).toBeNull();
  });

  it("reports no price at all when the offer quotes none", () => {
    const pricing = getOfferPricing(makeOffer({}), "en");

    expect(pricing.current).toBeNull();
    expect(pricing.strikethrough).toBeNull();
  });
});
