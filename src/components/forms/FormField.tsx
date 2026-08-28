import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const controlClass =
  "w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-base text-navy-900 transition-colors placeholder:text-sand-400 focus:border-gold-500 focus:outline-none disabled:bg-sand-50";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-navy-900">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-gold-700">
            {" *"}
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-sand-500">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
