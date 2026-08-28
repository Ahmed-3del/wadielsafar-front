/*
 * Date helpers for the booking forms.
 *
 * Everything here works in ISO date strings (YYYY-MM-DD) built from local
 * calendar parts. toISOString() converts to UTC and shifts the date back a day
 * for anyone east of Greenwich — which is every visitor this site has.
 */

export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Today, as the traveller's calendar sees it. */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/**
 * ISO date strings compare correctly with plain string comparison — the format
 * is fixed-width and big-endian — so there is no need to parse them to
 * compare, and no timezone to get wrong.
 */
export function isBeforeIso(value: string, floor: string): boolean {
  if (!value || !floor) return false;
  return value < floor;
}
