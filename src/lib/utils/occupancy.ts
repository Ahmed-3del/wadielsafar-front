/*
 * Rooms and who sleeps in them — the hotel and package search's "2 rooms,
 * 4 adults, 1 child". Travels through the URL as one compact parameter,
 * `occupancy=2-0,2-1` (adults-children per room), so the request form on the
 * other side can prefill its totals and still hand the agent the per-room
 * breakdown a quote is actually priced on.
 */

export interface Room {
  adults: number;
  children: number;
}

export const MAX_ROOMS = 4;
export const MAX_ADULTS = 6;
export const MAX_CHILDREN = 4;

export const DEFAULT_OCCUPANCY: Room[] = [{ adults: 2, children: 0 }];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);

export function serializeOccupancy(rooms: Room[]): string {
  return rooms.map((room) => `${String(room.adults)}-${String(room.children)}`).join(",");
}

/** Lenient: anything malformed falls back to the default rather than throwing
 *  — a hand-edited URL should land on a working form, not an error. */
export function parseOccupancy(value: string | undefined | null): Room[] | null {
  if (!value) return null;
  const rooms = value
    .split(",")
    .slice(0, MAX_ROOMS)
    .map((part) => {
      const [adults, children] = part.split("-").map(Number);
      return {
        adults: clamp(adults ?? 1, 1, MAX_ADULTS),
        children: clamp(children ?? 0, 0, MAX_CHILDREN),
      };
    });
  return rooms.length > 0 ? rooms : null;
}

export function totals(rooms: Room[]) {
  return rooms.reduce(
    (sum, room) => ({ adults: sum.adults + room.adults, children: sum.children + room.children }),
    { adults: 0, children: 0 },
  );
}
