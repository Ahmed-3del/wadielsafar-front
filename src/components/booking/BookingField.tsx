import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Shared control styling so every input/select inside the widget matches. */
export const bookingControlClass =
  "booking-control text-base font-semibold text-navy-900 placeholder:font-normal placeholder:text-sand-400";

interface BookingFieldProps {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

/*
 * Label sits above the value inside the field rather than beside it. Borrowed
 * from Direct KSA: in Arabic it keeps the label short and the value prominent,
 * and it survives narrow mobile widths where a side label would wrap.
 */
export function BookingField({ label, icon, children, className }: BookingFieldProps) {
  return (
    <label
      className={cn(
        // A tile on a phone — the widget lays the fields out as a two-column
        // grid there — and a plain divided cell of one row from lg up.
        "group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl bg-sand-50 px-3 py-2 ring-1 ring-sand-200/70 ring-inset transition-colors",
        "focus-within:ring-gold-500 hover:bg-sand-100",
        "lg:flex-1 lg:rounded-none lg:bg-transparent lg:px-4 lg:py-2.5 lg:ring-0 lg:hover:bg-sand-50 lg:focus-within:bg-sand-50",
        className,
      )}
    >
      {/* Icons from lg up only: at a phone field's width they were the
          difference between a value fitting and being cut off. */}
      <span className="text-navy-300 group-focus-within:text-gold-600 hidden shrink-0 transition-colors lg:block">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sand-500 block text-[11px] font-medium lg:text-xs">{label}</span>
        {children}
      </span>
    </label>
  );
}
