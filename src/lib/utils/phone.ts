/*
 * Phone rules, mirrored from the API.
 *
 * The backend stores what `common.validators.phone_validator` accepts: an
 * optional +, then 7 to 15 digits, no separators. The forms used to accept
 * "+966 50 123 4567" and "0501234567", both of which read perfectly well to a
 * person and both of which the API answers with a 400 — so a traveller filled
 * the form in correctly and lost the enquiry to a validation message they had
 * no way to predict.
 */

/** Spaces, dashes and brackets are how people write numbers down; they are not
 *  part of the number. Arabic-Indic digits are folded to ASCII for the same
 *  reason — a number typed on an Arabic keypad is still that number. */
export function toAsciiDigits(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";
  return value
    .split("")
    .map((char) => {
      const arabic = arabicIndic.indexOf(char);
      if (arabic !== -1) return String(arabic);
      const eastern = easternArabic.indexOf(char);
      return eastern === -1 ? char : String(eastern);
    })
    .join("");
}

export function normalizePhone(value: string): string {
  return toAsciiDigits(value).replace(/[\s\-().]/g, "");
}

/** The API's own rule. Run it on a normalized value. */
export const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(value));
}

/**
 * The national part of a number, as people write it locally.
 *
 * The leading 0 is a trunk prefix — it tells the local network "this is a
 * long-distance call" — and is dropped once a country code is present. Someone
 * in Riyadh types 0501234567; the number is +966501234567. Stripping it is
 * only safe because the country is asked for separately.
 */
export function toNationalDigits(input: string): string {
  return toAsciiDigits(input).replace(/\D/g, "").replace(/^0+/, "");
}
