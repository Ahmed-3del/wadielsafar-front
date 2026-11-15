import { getTranslations } from "next-intl/server";
import { parseOccupancy, totals } from "./occupancy";

/*
 * What a request page does with the search's `occupancy` parameter: the
 * totals, to prefill the form's own count fields, and the per-room breakdown
 * as fixed context sent with the request — the form has no field for "room 2
 * has a child", and that is exactly what an agent prices a quote on.
 */
export async function occupancyFromQuery(value: string | undefined) {
  const rooms = parseOccupancy(value);
  if (!rooms) return null;

  const t = await getTranslations("Booking");
  const sum = totals(rooms);
  return {
    rooms: rooms.length,
    people: sum.adults + sum.children,
    context: {
      key: "occupancy",
      label: t("occupancyLabel"),
      value: rooms
        .map((room, index) =>
          t("occupancyRoom", {
            n: index + 1,
            adults: t("adultsCount", { count: room.adults }),
            children: t("childrenCount", { count: room.children }),
          }),
        )
        .join(" | "),
    },
  };
}
