import { describe, expect, it } from "vitest";
import { asFormChoice, contactHref } from "./contact-link";
import type { ContactFormService } from "@/types/contact-form-service";

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

describe("asFormChoice", () => {
  const offered: ContactFormService[] = [
    { kind: "TYPE", value: "FLIGHT", service_id: null, slug: "", label_ar: "طيران", label_en: "Flight", order: 0 },
    { kind: "TYPE", value: "VISA", service_id: null, slug: "", label_ar: "تأشيرة", label_en: "Visa", order: 1 },
    { kind: "SERVICE", value: "OTHER", service_id: 12, slug: "travel-insurance", label_ar: "تأمين السفر", label_en: "Travel Insurance", order: 8 },
  ];

  it("accepts a base type that is on offer", () => {
    expect(asFormChoice("VISA", offered)).toBe("TYPE:VISA");
  });

  it("accepts a service by its slug, which is what a tile links to", () => {
    expect(asFormChoice("travel-insurance", offered)).toBe("SERVICE:12");
  });

  it("prefers the service when a slug and a type could both match", () => {
    // A service slugged "visa" must not silently become the base Visa type:
    // the two ask different questions.
    const both: ContactFormService[] = [
      ...offered,
      { kind: "SERVICE", value: "VISA", service_id: 20, slug: "VISA", label_ar: "ت", label_en: "Instant Visa", order: 9 },
    ];
    expect(asFormChoice("VISA", both)).toBe("SERVICE:20");
  });

  it("refuses one the panel is not offering", () => {
    // Hand-edited URLs reach this, and an entry switched off is off for a
    // reason.
    expect(asFormChoice("CRUISE", offered)).toBeNull();
    expect(asFormChoice("SAFARI", offered)).toBeNull();
    expect(asFormChoice(undefined, offered)).toBeNull();
  });
});
