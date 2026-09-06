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

/**
 * Whole days from today to an ISO date, negative once it has passed and null
 * for anything that is not a date.
 *
 * Both sides are read as local calendar days, so "tomorrow" is 1 whatever the
 * hour — a difference in milliseconds would call the same date 0 or 1
 * depending on when the page was rendered.
 *
 * It reads the clock, which a render is not allowed to do, so it lives here
 * rather than inside a component — see react-hooks/purity.
 */
export function daysUntilIso(iso: string | null | undefined): number | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const target = new Date(year, month - 1, day).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}
