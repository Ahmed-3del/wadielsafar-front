"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { BedIcon, CloseIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  MAX_ROOMS,
  serializeOccupancy,
  totals,
  type Room,
} from "@/lib/utils/occupancy";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface RoomsPickerProps {
  rooms: Room[];
  onChange: (rooms: Room[]) => void;
  /** Submitted with the form as `occupancy=2-0,2-1`. */
  name?: string;
}

/*
 * "2 rooms, 4 adults, 0 children" — one field that opens a panel of rooms,
 * each with its own adults and children, up to four rooms. The layout the
 * client pointed at, and the one Saudi travellers know from the big booking
 * sites.
 *
 * The panel is portalled and positioned against the field, like Combobox's
 * list: on a phone the widget can be pinned in a bar with a backdrop blur,
 * and a blurred ancestor traps `position: fixed` — an in-place panel opened
 * inside the bar's own box and was cut off by it.
 */
export function RoomsPicker({ rooms, onChange, name = "occupancy" }: RoomsPickerProps) {
  const t = useTranslations("Booking");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const sum = totals(rooms);
  const label = [
    t("roomsCount", { count: rooms.length }),
    t("adultsCount", { count: sum.adults }),
    t("childrenCount", { count: sum.children }),
  ].join("، ");

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const box = anchor.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(400, window.innerWidth - margin * 2);
    // Pinned to the field's inline-end edge in RTL (its right), start in LTR,
    // then kept on screen.
    const rtl = document.documentElement.dir === "rtl";
    const preferred = rtl ? box.right - width : box.left;
    const left = Math.min(Math.max(margin, preferred), window.innerWidth - width - margin);
    setRect({ top: box.bottom + 8, left, width });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        anchorRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = (index: number, patch: Partial<Room>) => {
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-sand-200 bg-white px-2 text-sm font-semibold text-navy-900 focus:border-gold-500 focus:outline-none";

  const panel =
    open && rect
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t("roomsGuests")}
            style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width, zIndex: 60 }}
            className="animate-combobox rounded-2xl border border-sand-200 bg-white p-3 shadow-2xl shadow-navy-900/10"
          >
            {/* Column heads once, over every room, rather than a label per
                select — the reference's layout, and half the height. */}
            <div className="grid grid-cols-[1fr_6.5rem_6.5rem_1.75rem] items-end gap-2 px-1 pb-1.5 text-[11px] text-sand-500">
              <span />
              <span>{t("adultsHeader")}</span>
              <span>{t("childrenHeader")}</span>
              <span />
            </div>

            <ul className="divide-y divide-sand-100">
              {rooms.map((room, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[1fr_6.5rem_6.5rem_1.75rem] items-center gap-2 px-1 py-2"
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-navy-900">
                    <BedIcon className="h-4 w-4 text-sand-400" />
                    {t("roomLabel", { n: index + 1 })}
                  </span>
                  <select
                    aria-label={`${t("roomLabel", { n: index + 1 })} — ${t("adultsHeader")}`}
                    className={selectClass}
                    value={room.adults}
                    onChange={(event) => {
                      update(index, { adults: Number(event.target.value) });
                    }}
                  >
                    {Array.from({ length: MAX_ADULTS }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {t("adultsCount", { count: n })}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={`${t("roomLabel", { n: index + 1 })} — ${t("childrenHeader")}`}
                    className={selectClass}
                    value={room.children}
                    onChange={(event) => {
                      update(index, { children: Number(event.target.value) });
                    }}
                  >
                    {Array.from({ length: MAX_CHILDREN + 1 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {t("childrenCount", { count: n })}
                      </option>
                    ))}
                  </select>
                  {/* The first room cannot be removed: there is always at
                      least one. */}
                  {index > 0 ? (
                    <button
                      type="button"
                      aria-label={t("removeRoom", { n: index + 1 })}
                      onClick={() => {
                        onChange(rooms.filter((_, i) => i !== index));
                      }}
                      className="grid h-7 w-7 place-items-center rounded-full text-sand-500 transition-colors hover:bg-sand-100 hover:text-navy-900"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-1 flex items-center justify-between gap-3 border-t border-sand-200 px-1 pt-3">
              <div className="min-w-0">
                <button
                  type="button"
                  disabled={rooms.length >= MAX_ROOMS}
                  onClick={() => {
                    onChange([...rooms, { adults: 2, children: 0 }]);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-bold text-gold-700 transition-colors hover:text-gold-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t("addRoom")}
                </button>
                <p className="mt-0.5 text-[11px] text-sand-500">
                  {t("maxRooms", { max: MAX_ROOMS })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="shrink-0 rounded-full bg-navy-900 px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                {t("done")}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <input type="hidden" name={name} value={serializeOccupancy(rooms)} />
      <button
        ref={anchorRef}
        type="button"
        // Named explicitly: inside the field's <label>, the button would
        // otherwise be announced by the label alone and never say what is
        // chosen.
        aria-label={`${t("roomsGuests")}: ${label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((was) => !was);
        }}
        className={cn(
          "booking-control block truncate text-start text-base font-semibold text-navy-900",
        )}
      >
        {label}
      </button>
      {panel}
    </>
  );
}
