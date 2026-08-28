import { describe, expect, it } from "vitest";
import { resolveServiceHref } from "./services";

describe("resolveServiceHref", () => {
  it("maps a slug straight onto its section route", () => {
    expect(resolveServiceHref("flights")).toBe("/flights");
    expect(resolveServiceHref("visas")).toBe("/visas");
  });

  it("matches editorial slugs by stem", () => {
    expect(resolveServiceHref("flight-booking")).toBe("/flights");
    expect(resolveServiceHref("hotel-booking")).toBe("/hotels");
    expect(resolveServiceHref("umrah-packages")).toBe("/packages");
    expect(resolveServiceHref("corporate-travel")).toBe("/corporate");
  });

  it("ignores slug casing", () => {
    expect(resolveServiceHref("Hotel-Reservations")).toBe("/hotels");
  });

  it("sends service lines without a section route to the inquiry form", () => {
    expect(resolveServiceHref("event-management")).toBe("/contact");
  });
});
