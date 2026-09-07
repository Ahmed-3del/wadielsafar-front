import { describe, expect, it } from "vitest";
import { asServiceType, contactHref } from "./contact-link";

describe("contactHref", () => {
  it("is the plain form when there is nothing to carry", () => {
    expect(contactHref()).toBe("/contact");
  });

  it("carries the service the reader pressed", () => {
    expect(contactHref({ service: "CRUISE" })).toBe("/contact?service=CRUISE");
  });

  it("carries a claimed offer and its code", () => {
    expect(contactHref({ offer: "Summer sale", promo: "SUMMER20" })).toBe(
      "/contact?offer=Summer+sale&promo=SUMMER20",
    );
  });

  it("escapes wording that would otherwise break the query string", () => {
    expect(contactHref({ topic: "Flights & hotels" })).toBe("/contact?topic=Flights+%26+hotels");
  });

  it("drops what is missing rather than sending an empty key", () => {
    // A package with no title would otherwise reach the form as "About: ".
    expect(contactHref({ service: "PACKAGE", topic: "   " })).toBe("/contact?service=PACKAGE");
  });
});

describe("asServiceType", () => {
  const offered = [{ value: "FLIGHT" as const }, { value: "VISA" as const }];

  it("accepts a service that is on offer", () => {
    expect(asServiceType("VISA", offered)).toBe("VISA");
  });

  it("refuses one the panel is not offering", () => {
    // Hand-edited URLs reach this, and an entry switched off is off for a
    // reason.
    expect(asServiceType("CRUISE", offered)).toBeNull();
    expect(asServiceType("SAFARI", offered)).toBeNull();
    expect(asServiceType(undefined, offered)).toBeNull();
  });
});
