import { describe, expect, it } from "vitest";
import {
  budgetBandFor,
  budgetBounds,
  filterByBudget,
  nightsOf,
  tripTypesOf,
} from "./budget-filter";
import type { Package } from "@/types/package";

function pkg(price: string, days: number, category = "family", slug = price): Package {
  return {
    id: Number(price),
    title_ar: slug,
    title_en: slug,
    slug,
    category: { id: 1, name_ar: category, name_en: category, slug: category },
    destination: {
      id: 1,
      name_ar: "دبي",
      name_en: "Dubai",
      slug: "dubai",
      description_ar: "",
      description_en: "",
      country_ar: "الإمارات",
      country_en: "UAE",
      cover_image: null,
    },
    description_ar: "",
    description_en: "",
    duration_days: days,
    included_services_ar: "",
    included_services_en: "",
    price_from: price,
    cover_image: null,
    is_featured: false,
  };
}

describe("filterByBudget", () => {
  const catalogue = [pkg("12500", 8), pkg("3900", 4), pkg("6200", 6), pkg("4799", 5)];

  it("keeps only what the budget covers", () => {
    const result = filterByBudget(catalogue, { budget: 5000, nights: "any", tripType: "any" });
    expect(result.map((p) => p.price_from)).toEqual(["3900", "4799"]);
  });

  it("sorts by price numerically, not as text", () => {
    const result = filterByBudget(catalogue, { budget: 99999, nights: "any", tripType: "any" });
    expect(result.map((p) => p.price_from)).toEqual(["3900", "4799", "6200", "12500"]);
  });

  it("includes a package priced exactly at the budget", () => {
    expect(filterByBudget(catalogue, { budget: 3900, nights: "any", tripType: "any" })).toHaveLength(1);
  });

  it("bands by nights rather than days", () => {
    // The catalogue runs 4, 5, 6 and 8 days — so 3, 4, 5 and 7 nights.
    const nights = (band: "short" | "medium" | "long") =>
      filterByBudget(catalogue, { budget: 99999, nights: band, tripType: "any" }).map(nightsOf);

    expect(nights("short")).toEqual([3, 4]);
    expect(nights("medium")).toEqual([5, 7]);
    expect(nights("long")).toEqual([]);
  });

  it("returns nothing rather than throwing on an empty catalogue", () => {
    expect(filterByBudget([], { budget: 5000, nights: "any", tripType: "any" })).toEqual([]);
  });
});

describe("filterByBudget, by trip type", () => {
  const catalogue = [
    pkg("3900", 4, "family"),
    pkg("6200", 6, "honeymoon"),
    pkg("4799", 5, "religious"),
  ];

  it("keeps only the chosen category", () => {
    const result = filterByBudget(catalogue, {
      budget: 99999,
      nights: "any",
      tripType: "religious",
    });
    expect(result.map((p) => p.category.slug)).toEqual(["religious"]);
  });

  it("keeps everything on \"any\"", () => {
    const result = filterByBudget(catalogue, { budget: 99999, nights: "any", tripType: "any" });
    expect(result).toHaveLength(3);
  });

  it("combines with the budget rather than replacing it", () => {
    const result = filterByBudget(catalogue, {
      budget: 4000,
      nights: "any",
      tripType: "honeymoon",
    });
    expect(result).toEqual([]);
  });
});

describe("tripTypesOf", () => {
  it("offers the client's order first, then whatever else the catalogue holds", () => {
    const catalogue = [
      pkg("1", 3, "cultural"),
      pkg("2", 3, "adventure"),
      pkg("3", 3, "family"),
      pkg("4", 3, "religious"),
    ];
    expect(tripTypesOf(catalogue).map((t) => t.slug)).toEqual([
      "family",
      "religious",
      "adventure",
      "cultural",
    ]);
  });

  it("lists each category once", () => {
    const catalogue = [pkg("1", 3, "family"), pkg("2", 4, "family")];
    expect(tripTypesOf(catalogue)).toHaveLength(1);
  });

  it("offers nothing for an empty catalogue, so the row can be hidden", () => {
    expect(tripTypesOf([])).toEqual([]);
  });
});

describe("budgetBounds", () => {
  it("rounds outward to the step so the track covers every price", () => {
    expect(budgetBounds([pkg("3900", 4), pkg("12500", 8)])).toEqual({ min: 3500, max: 12500 });
  });

  it("gives a usable track when every package costs the same", () => {
    const { min, max } = budgetBounds([pkg("5000", 4), pkg("5000", 5)]);
    expect(max).toBeGreaterThan(min);
  });

  it("survives an empty catalogue", () => {
    expect(budgetBounds([])).toEqual({ min: 0, max: 500 });
  });
});

describe("budgetBandFor", () => {
  it("maps a budget onto the planner's bands", () => {
    expect(budgetBandFor(3000)).toBe("under5k");
    expect(budgetBandFor(7500)).toBe("5to10k");
    expect(budgetBandFor(15000)).toBe("10to20k");
    expect(budgetBandFor(25000)).toBe("over20k");
  });

  it("treats the value as a ceiling, so a band boundary does not overstate it", () => {
    // Someone who can spend at most 10,000 is in "5,000 to 10,000". Reading it
    // as containment would put them in "10,000 to 20,000" and have an agent
    // quote trips they have already ruled out.
    expect(budgetBandFor(5000)).toBe("under5k");
    expect(budgetBandFor(10000)).toBe("5to10k");
    expect(budgetBandFor(20000)).toBe("10to20k");
  });
});
