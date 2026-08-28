import { describe, expect, it } from "vitest";
import { DIAL_CODES, dialFor, iso2ForNumber } from "./dial-codes";

describe("the dial code table", () => {
  it("has no duplicate countries", () => {
    const codes = DIAL_CODES.map((entry) => entry.iso2);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("holds only well-formed ISO codes and digit-only prefixes", () => {
    for (const entry of DIAL_CODES) {
      expect(entry.iso2).toMatch(/^[A-Z]{2}$/);
      expect(entry.dial).toMatch(/^\d{1,4}$/);
    }
  });

  it("names every country the browser can, so no row renders as a bare code", () => {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    for (const entry of DIAL_CODES) {
      expect(display.of(entry.iso2)).not.toBe(entry.iso2);
    }
  });
});

describe("dialFor", () => {
  it("finds a country's prefix", () => {
    expect(dialFor("SA")).toBe("966");
    expect(dialFor("EG")).toBe("20");
  });

  it("answers with nothing for a country it does not carry", () => {
    expect(dialFor("ZZ")).toBe("");
  });
});

describe("iso2ForNumber", () => {
  it("reads the country back off a full number", () => {
    expect(iso2ForNumber("+966501234567")?.iso2).toBe("SA");
  });

  it("prefers the longest matching prefix", () => {
    // +1868 is Trinidad; matching the bare +1 first would call it American.
    expect(iso2ForNumber("+18685551234")?.iso2).toBe("TT");
  });

  it("picks one country for a prefix several share", () => {
    expect(iso2ForNumber("+12125551234")?.iso2).toBe("US");
    expect(iso2ForNumber("+79161234567")?.iso2).toBe("RU");
  });

  it("works without the leading plus", () => {
    expect(iso2ForNumber("966501234567")?.iso2).toBe("SA");
  });

  it("answers with nothing for a number it cannot place", () => {
    expect(iso2ForNumber("+0001234")).toBeUndefined();
  });
});
