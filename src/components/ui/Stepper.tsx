import { cn } from "@/lib/utils/cn";
import { CheckIcon } from "./icons";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the step currently being filled in. */
  current: number;
  className?: string;
}

/*
 * Progress indicator for the visa application. Completed steps collapse to a
 * tick rather than keeping their number: it makes "how much is left" readable
 * at a glance, which is the only job this component has.
 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-colors",
                done && "border-gold-500 bg-gold-500 text-navy-900",
                active && "border-gold-500 bg-white text-navy-900",
                !done && !active && "border-sand-200 bg-white text-sand-400",
              )}
            >
              {done ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-xs font-semibold sm:text-sm",
                active ? "text-navy-900" : "text-sand-500",
                // Only the active label survives on narrow screens; three full
                // labels at 390px wrap into an unreadable stack.
                !active && "hidden sm:inline",
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1 rounded-full transition-colors",
                  done ? "bg-gold-500" : "bg-sand-200",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
