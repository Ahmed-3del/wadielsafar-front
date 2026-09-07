"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/utils/cn";
import { todayIso } from "@/lib/utils/dates";
import type { InquiryField } from "@/types/inquiry-field";

/*
 * Generic over the parent's form values rather than typed to one shape: the
 * keys under `details` are rows in a database, so they cannot be known here.
 */
interface InquiryDetailFieldsProps<TValues extends FieldValues> {
  fields: InquiryField[];
  /** RHF's register, bound to the parent form's `details` object. */
  register: UseFormRegister<TValues>;
  errors: FieldErrors<TValues>;
  className?: string;
}

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

/*
 * The questions the panel says to ask for the chosen service.
 *
 * Everything here is content: the labels, the options, whether an answer is
 * required, and the order. The only thing this file decides is how each type
 * is drawn — which is the one part a person editing rows should not have to
 * think about.
 */
export function InquiryDetailFields<TValues extends FieldValues>({
  fields,
  register,
  errors,
  className,
}: InquiryDetailFieldsProps<TValues>) {
  const locale = useLocale();
  const t = useTranslations("InquiryForm");
  const isArabic = locale === "ar";

  if (fields.length === 0) return null;

  /* `details` is an object of runtime keys, so its errors need naming here —
     the one cast in this file, alongside the register paths below. */
  const detailErrors = (errors.details ?? {}) as Record<string, { message?: string } | undefined>;

  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>
      {fields.map((field) => {
        const label = isArabic ? field.label_ar : field.label_en;
        const placeholder = isArabic ? field.placeholder_ar : field.placeholder_en;
        const id = `details-${field.key}`;
        const invalid = Boolean(detailErrors[field.key]);
        // A long answer gets the full width; everything else pairs up.
        const wide = field.field_type === "TEXTAREA";

        return (
          <div key={field.id} className={wide ? "sm:col-span-2" : undefined}>
            <label htmlFor={id} className="block text-sm font-medium text-navy-900">
              {label}
              {field.is_required ? <span aria-hidden="true" className="text-gold-700"> *</span> : null}
            </label>

            {field.field_type === "CHECKBOX" ? (
              /* Several answers at once. The service pages draw these as a
                 button grid; here they are plain checkboxes, which is the
                 same question asked more simply. */
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                {field.options.map((option) => {
                  const value = isArabic ? option.ar : option.en;
                  return (
                    <label key={option.en} className="flex items-center gap-2 text-sm text-navy-900">
                      <input
                        type="checkbox"
                        value={value}
                        className="h-4 w-4 rounded border-sand-300"
                        {...register(`details.${field.key}` as Path<TValues>)}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
            ) : field.field_type === "SELECT" || field.field_type === "SEGMENTED" ? (
              <select id={id} className={fieldClass} defaultValue="" {...register(`details.${field.key}` as Path<TValues>)}>
                <option value="">{placeholder || t("chooseOption")}</option>
                {field.options.map((option) => (
                  <option key={option.en} value={isArabic ? option.ar : option.en}>
                    {isArabic ? option.ar : option.en}
                  </option>
                ))}
              </select>
            ) : field.field_type === "TEXTAREA" ? (
              <textarea
                id={id}
                rows={3}
                placeholder={placeholder}
                className={cn(fieldClass, "resize-none")}
                {...register(`details.${field.key}` as Path<TValues>)}
              />
            ) : (
              <input
                id={id}
                /* A count and a search box both come through as their
                   nearest plain input here: the stepper and the airport
                   picker are the service pages' controls, and this form asks
                   the same question without them. */
                type={
                  field.field_type === "DATE"
                    ? "date"
                    : field.field_type === "NUMBER" || field.field_type === "STEPPER"
                      ? "number"
                      : "text"
                }
                // A trip that starts yesterday is a typo, and the API refuses
                // it too — greying the days out is kinder than a rejection.
                min={
                  field.field_type === "DATE"
                    ? field.not_past
                      ? todayIso()
                      : undefined
                    : (field.min_value ?? undefined)
                }
                max={field.max_value ?? undefined}
                placeholder={placeholder}
                className={fieldClass}
                {...register(`details.${field.key}` as Path<TValues>)}
              />
            )}

            {invalid ? <p className="mt-1 text-sm text-red-600">{t("errors.required")}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
