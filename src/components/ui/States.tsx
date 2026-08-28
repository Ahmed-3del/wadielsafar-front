import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StateProps {
  title: string;
  description?: string;
  /** Always give the user somewhere to go — an empty state without an exit is a
   *  dead end. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-sand-300 bg-sand-50 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-navy-300 shadow-xs">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mt-4 text-lg font-semibold text-navy-900">{title}</p>
      {description ? <p className="mt-1.5 text-sm text-sand-600">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-danger-50 bg-danger-50/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-danger-600 shadow-xs">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M12 8v5M12 16.5v.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <p className="mt-4 text-lg font-semibold text-navy-900">{title}</p>
      {description ? <p className="mt-1.5 text-sm text-sand-600">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
