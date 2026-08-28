import { describe, expect, it } from "vitest";
import { isValidPhone, normalizePhone, toNationalDigits } from "./phone";

describe("normalizePhone", () => {
  it("strips the spaces people actually type", () => {
    expect(normalizePhone("+966 50 123 4567")).toBe("+966501234567");
  });

  it("strips dashes and brackets too", () => {
    expect(normalizePhone("+966-50-123-4567")).toBe("+966501234567");
    expect(normalizePhone("+966 (50) 123.4567")).toBe("+966501234567");
  });

  it("folds Arabic-Indic digits — a number typed on an Arabic keypad is still that number", () => {
    expect(normalizePhone("+٩٦٦٥٠١٢٣٤٥٦٧")).toBe("+966501234567");
  });

  it("leaves an already-clean number alone", () => {
    expect(normalizePhone("+966501234567")).toBe("+966501234567");
  });
});

describe("isValidPhone", () => {
  it("accepts a number written the way a person writes it", () => {
    // This is the case that used to pass the form and then 400 at the API.
    expect(isValidPhone("+966 50 123 4567")).toBe(true);
  });

  it("accepts an international number without the plus", () => {
    expect(isValidPhone("966501234567")).toBe(true);
  });

  it("rejects a local number with a leading zero", () => {
    // The API stores international format only, so the form has to say so
    // rather than let the traveller find out from a 400.
    expect(isValidPhone("0501234567")).toBe(false);
  });

  it("rejects letters, which a bare length check used to allow through", () => {
    expect(isValidPhone("call me")).toBe(false);
    expect(isValidPhone("aaaaaaaa")).toBe(false);
  });

  it("rejects numbers that are too short or too long", () => {
    expect(isValidPhone("+96650")).toBe(false);
    expect(isValidPhone("+9665012345678901234")).toBe(false);
  });
});

describe("toNationalDigits", () => {
  it("drops the trunk prefix a Saudi types", () => {
    // The case that used to be refused outright.
    expect(toNationalDigits("0501234567")).toBe("501234567");
  });

  it("drops an Egyptian trunk prefix too", () => {
    expect(toNationalDigits("01012345678")).toBe("1012345678");
  });

  it("leaves a number with no trunk prefix alone", () => {
    expect(toNationalDigits("501234567")).toBe("501234567");
  });

  it("strips separators as they are typed", () => {
    expect(toNationalDigits("050 123 4567")).toBe("501234567");
  });

  it("folds Arabic-Indic digits", () => {
    expect(toNationalDigits("٠٥٠١٢٣٤٥٦٧")).toBe("501234567");
  });

  it("refuses letters rather than keeping them", () => {
    expect(toNationalDigits("call me 050")).toBe("50");
  });
});
