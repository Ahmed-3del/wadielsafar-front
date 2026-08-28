import { describe, expect, it } from "vitest";
import { isBeforeIso, toIsoDate, todayIso } from "./dates";

describe("toIsoDate", () => {
  it("reads the local calendar, not UTC", () => {
    // 00:30 local on the 15th. toISOString() would call this the 14th for
    // anyone east of Greenwich, which is every visitor this site has.
    const justAfterMidnight = new Date(2026, 0, 15, 0, 30);
    expect(toIsoDate(justAfterMidnight)).toBe("2026-01-15");
  });

  it("pads single-digit months and days", () => {
    expect(toIsoDate(new Date(2026, 2, 5))).toBe("2026-03-05");
  });
});

describe("todayIso", () => {
  it("is a well-formed ISO date", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("isBeforeIso", () => {
  it("orders dates across a month boundary", () => {
    expect(isBeforeIso("2026-01-31", "2026-02-01")).toBe(true);
    expect(isBeforeIso("2026-02-01", "2026-01-31")).toBe(false);
  });

  it("orders dates across a year boundary", () => {
    expect(isBeforeIso("2025-12-31", "2026-01-01")).toBe(true);
  });

  it("treats the same day as not before — a day trip is a real booking", () => {
    expect(isBeforeIso("2026-05-10", "2026-05-10")).toBe(false);
  });

  it("says nothing when either side is missing", () => {
    // An empty return date is not an error; it is an unanswered question.
    expect(isBeforeIso("", "2026-05-10")).toBe(false);
    expect(isBeforeIso("2026-05-10", "")).toBe(false);
  });
});
