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
        "group relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
        "hover:bg-sand-50 focus-within:bg-sand-50",
        className,
      )}
    >
      <span className="shrink-0 text-navy-300 transition-colors group-focus-within:text-gold-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-sand-500">{label}</span>
        {children}
      </span>
    </label>
  );
}
