"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/Button";
import { FormField, controlClass } from "./FormField";
import { PhoneField } from "./PhoneField";
import { WhatsAppIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { AirportPicker } from "@/components/booking/LocationPicker";
import { createInquiry } from "@/lib/api/inquiries";
import { ApiError } from "@/lib/api/client";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { isBeforeIso, todayIso } from "@/lib/utils/dates";
import { isValidPhone, normalizePhone } from "@/lib/utils/phone";
import type { RequestFieldDef } from "@/features/requests/fields";
import type { ServiceType } from "@/types/inquiry";

interface ServiceRequestFormProps {
  serviceType: ServiceType;
  fields: RequestFieldDef[];
  /** Prefill from the hero widget or a visa page, e.g. { to: "دبي" }. */
  defaults?: Record<string, string>;
  /** Fixed, non-editable context sent with the request (e.g. the chosen visa).
   *  Labels are supplied by the caller because these keys are not in the field
   *  config and next-intl has no fallback for a missing key. */
  context?: { key: string; label: string; value: string }[];
  /** Heading shown above the contact section. */
  title?: string;
  /** Shown above the fields when they arrived pre-filled from a search. */
  notice?: string;
}

type FormValues = Record<string, string | string[]>;

/*
 * One engine behind every service request. Flights, hotels and visas are not
 * searches — there is no live inventory — so each of these forms captures what
 * an agent needs to quote, files it as an inquiry the panel can work, and hands
 * the customer to WhatsApp where Saudi travel deals actually get closed.
 */
export function ServiceRequestForm({
  serviceType,
  fields,
  defaults = {},
  context = [],
  title,
  notice,
}: ServiceRequestFormProps) {
  const t = useTranslations("RequestForm");
  const tDates = useTranslations("Dates");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState<null | { waUrl: string }>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      trip_type: "ROUND_TRIP",
      passengers: "1",
      guests: "2",
      rooms: "1",
      travellers: "1",
      ...defaults,
    },
  });

  // useWatch rather than watch(): subscribing through the hook keeps this
  // compatible with the React Compiler, which flags reads of `watch` in render.
  const values = useWatch({ control });
  const visibleFields = fields.filter(
    (field) => !field.showWhen || values[field.showWhen.field] === field.showWhen.equals,
  );

  /* Consecutive fields sharing a group become one titled block. Consecutive,
   * not collected: the field order in the config is the reading order, and
   * regrouping would silently reorder someone's form. */
  const blocks: { key: RequestFieldDef["group"] | null; fields: RequestFieldDef[] }[] = [];
  for (const field of visibleFields) {
    const key = field.group ?? null;
    const last = blocks.at(-1);
    if (last && last.key === key) last.fields.push(field);
    else blocks.push({ key, fields: [field] });
  }

  /** Checkbox groups arrive as arrays; the API's `details` accepts flat scalars
   *  only, and an agent reads a comma list more easily than a JSON array. */
  function flatten(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value.join(", ");
    return value ?? "";
  }

  /** Human-readable summary for WhatsApp — an agent reads this, not a machine. */
  function buildSummary(values: FormValues) {
    const lines = [t("waIntro", { service: t(`services.${serviceType}`) })];
    for (const item of context) {
      if (item.value) lines.push(`• ${item.label}: ${item.value}`);
    }
    for (const field of visibleFields) {
      const raw = values[field.name];
      const value = flatten(raw);
      if (!value) continue;

      // Selects and checkboxes carry enum values; an agent reading this on
      // WhatsApp should see the label, not ROUND_TRIP. `details` keeps the raw
      // value so the panel stays machine-readable.
      const labelFor = (item: string) => {
        const option = field.options?.find((o) => o.value === item);
        if (!option || /^[0-9]+$/.test(option.label)) return item;
        return t(`options.${option.label as Exclude<typeof option.label, `${number}`>}`);
      };
      const display = Array.isArray(raw) ? raw.map(labelFor).join("، ") : labelFor(value);
      lines.push(`• ${t(`labels.${field.labelKey}`)}: ${display}`);
    }
    if (values.notes) lines.push(`• ${t("labels.notes")}: ${flatten(values.notes)}`);
    lines.push(`• ${t("labels.name")}: ${flatten(values.name)}`);
    return lines.join("\n");
  }

  async function onSubmit(values: FormValues) {
    setFormError(null);
    // Only the service-specific answers go into `details`; contact fields have
    // their own columns on the inquiry.
    const details: Record<string, string> = Object.fromEntries(
      context.map((item) => [item.key, item.value]),
    );
    for (const field of visibleFields) {
      const value = flatten(values[field.name]);
      if (value) details[field.name] = value;
    }

    const waUrl = whatsappLink(buildSummary(values));

    try {
      await createInquiry({
        name: String(values.name),
        email: String(values.email),
        phone: normalizePhone(String(values.phone)),
        service_type: serviceType,
        destination: null,
        travel_date: flatten(values.depart ?? values.check_in ?? values.travel_date) || null,
        message: flatten(values.notes),
        source: "WEBSITE",
        details,
      });
    } catch (error) {
      // The lead still matters even if the API is unreachable — let the
      // customer continue on WhatsApp rather than losing them to an error.
      setFormError(error instanceof ApiError ? error.message : t("errorGeneric"));
      setSubmitted({ waUrl });
      return;
    }

    setSubmitted({ waUrl });
    // Opening here keeps the click inside the user-gesture chain where popup
    // blockers still allow it; the success panel repeats the link regardless.
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  /** The earliest date a field will accept, as a `min` attribute value. */
  function dateFloor(field: RequestFieldDef): string | undefined {
    const linked = field.notBefore ? String(values[field.notBefore] ?? "") : "";
    // Whichever floor is later wins: a return date is bounded by its departure
    // once one is chosen, and by today until then.
    const floors = [field.notPast ? todayIso() : "", linked].filter(Boolean);
    return floors.length > 0 ? floors.sort().at(-1) : undefined;
  }

  /** Fields whose floor is this one, so editing it re-checks them. */
  function dependentDates(field: RequestFieldDef): string[] {
    return fields.filter((item) => item.notBefore === field.name).map((item) => item.name);
  }

  function validateDate(field: RequestFieldDef, value: unknown): string | true {
    if (typeof value !== "string" || !value) return true;
    if (field.notPast && isBeforeIso(value, todayIso())) return tDates("past");
    if (field.notBefore) {
      const other = String(values[field.notBefore] ?? "");
      const otherField = fields.find((item) => item.name === field.notBefore);
      if (other && isBeforeIso(value, other) && otherField) {
        return tDates("notBefore", { field: t(`labels.${otherField.labelKey}`) });
      }
    }
    return true;
  }

  /** One field, used by every block. Declared once rather than inlined so
   *  grouped and ungrouped forms cannot drift apart. */
  function renderField(field: RequestFieldDef) {
    const id = `field-${field.name}`;
    const label = t(`labels.${field.labelKey}`);
    const error = errors[field.name]?.message;

    return (
      <FormField
        key={field.name}
        label={label}
        htmlFor={id}
        required={field.required}
        error={typeof error === "string" ? error : undefined}
        className={field.wide ? "sm:col-span-2" : undefined}
      >
        {field.type === "stepper" ? (
          // Two buttons instead of a dropdown: a passenger count is the field
          // people change most often and a select makes them aim twice.
          <Controller
            name={field.name}
            control={control}
            render={({ field: bound }) => {
              const min = field.min ?? 1;
              const max = field.max ?? 99;
              const current = Math.min(Math.max(Number(bound.value) || min, min), max);
              const step = (delta: number) => {
                bound.onChange(String(Math.min(Math.max(current + delta, min), max)));
              };

              return (
                <div className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white p-1.5">
                  <button
                    type="button"
                    onClick={() => { step(-1); }}
                    disabled={current <= min}
                    aria-label={`${t("decrease")} — ${label}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-navy-900 transition-colors hover:bg-sand-100 active:bg-sand-200 disabled:pointer-events-none disabled:opacity-35"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  {/* aria-live so a screen reader hears the new count without
                      having to go looking for it after each tap. */}
                  <output aria-live="polite" className="flex-1 text-center text-base font-bold text-navy-900">
                    {current}
                  </output>
                  <button
                    type="button"
                    onClick={() => { step(1); }}
                    disabled={current >= max}
                    aria-label={`${t("increase")} — ${label}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-navy-900 transition-colors hover:bg-sand-100 active:bg-sand-200 disabled:pointer-events-none disabled:opacity-35"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            }}
          />
        ) : field.type === "segmented" ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: bound }) => (
              <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
                {field.options?.map((option) => {
                  const selected = String(bound.value ?? "") === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => { bound.onChange(option.value); }}
                      className={cn(
                        "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out-soft",
                        selected
                          ? "border-gold-500 bg-gold-50 text-navy-900"
                          : "border-sand-200 text-sand-600 hover:border-navy-300 hover:text-navy-900",
                      )}
                    >
                      {/^[0-9]+$/.test(option.label)
                        ? option.label
                        : t(`options.${option.label as Exclude<typeof option.label, `${number}`>}`)}
                    </button>
                  );
                })}
              </div>
            )}
          />
        ) : field.type === "checkbox" ? (
          // A visible grid of toggles rather than a multi-select: the
          // options are the point of this question, and a collapsed
          // control hides what the traveller can actually ask for.
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-sand-200 px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-navy-300 has-checked:border-gold-500 has-checked:bg-gold-50"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  className="h-4 w-4 shrink-0 rounded border-sand-300 accent-gold-500"
                  {...register(field.name)}
                />
                {/^[0-9]+$/.test(option.label)
                  ? option.label
                  : t(`options.${option.label as Exclude<typeof option.label, `${number}`>}`)}
              </label>
            ))}
          </div>
        ) : field.type === "airport" || field.type === "city" ? (
          // Same catalogue and same behaviour as the hero search, so a
          // traveller who arrived from there recognises the control.
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? t("required") : false }}
            render={({ field: bound }) => (
              <AirportPicker
                id={id}
                mode={field.type === "airport" ? "airport" : "city"}
                value={typeof bound.value === "string" ? bound.value : ""}
                onChange={bound.onChange}
                required={field.required}
              />
            )}
          />
        ) : field.type === "select" ? (
          <select
            id={id}
            className={controlClass}
            {...register(field.name, {
              required: field.required ? t("required") : false,
            })}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {/^[0-9]+$/.test(option.label)
                  ? option.label
                  : t(`options.${option.label as Exclude<typeof option.label, `${number}`>}`)}
              </option>
            ))}
          </select>
        ) : field.type === "date" ? (
          /* The floor is both a `min` attribute and a validate rule. The
             attribute greys out the impossible days in the native picker,
             which is what stops the mistake; the rule is what catches it when
             someone types the date instead. */
          <input
            id={id}
            type="date"
            min={dateFloor(field)}
            className={controlClass}
            {...register(field.name, {
              required: field.required ? t("required") : false,
              validate: (value) => validateDate(field, value),
              // Moving the departure later has to re-check the return, which
              // was validated against the old date and is now stale.
              deps: dependentDates(field),
            })}
          />
        ) : (
          <input
            id={id}
            type="text"
            placeholder={field.placeholderKey ? t(`labels.${field.placeholderKey}`) : undefined}
            className={controlClass}
            {...register(field.name, {
              required: field.required ? t("required") : false,
            })}
          />
        )}
      </FormField>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-600">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-navy-900">{t("successTitle")}</h3>
        <p className="mt-2 text-sm leading-7 text-sand-600">{t("successBody")}</p>
        {formError ? (
          <p className="mt-3 text-xs text-danger-600">{t("successDegraded")}</p>
        ) : null}
        <a
          href={submitted.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants("whatsapp", "lg"), "mt-6")}
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("continueOnWhatsapp")}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {title ? <h2 className="text-lg font-bold text-navy-900">{title}</h2> : null}

      {/* Someone who searched from the homepage lands here with the fields
          already answered. Saying so is what stops them re-reading a form they
          have effectively already filled in. */}
      {notice ? (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-gold-50 px-4 py-3 text-sm leading-6 text-navy-900">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-gold-700" />
          {notice}
        </p>
      ) : null}

      {blocks.map((block, index) => (
        <div
          key={block.key ?? `block-${index}`}
          className={cn(
            index === 0 ? title && "mt-6" : "mt-8 border-t border-sand-200 pt-6",
          )}
        >
          {block.key ? (
            <h3 className="mb-5 text-base font-bold text-navy-900">{t(`groups.${block.key}`)}</h3>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">{block.fields.map(renderField)}</div>
        </div>
      ))}


      <div className="mt-8 border-t border-sand-200 pt-6">
        <h3 className="text-base font-bold text-navy-900">{t("contactTitle")}</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label={t("labels.name")}
            htmlFor="field-name"
            required
            error={errors.name?.message}
          >
            <input
              id="field-name"
              className={controlClass}
              {...register("name", { required: t("required") })}
            />
          </FormField>
          <FormField
            label={t("labels.phone")}
            htmlFor="field-phone"
            required
            error={errors.phone?.message}
            hint={t("phoneHint")}
          >
            <Controller
              name="phone"
              control={control}
              rules={{
                required: t("required"),
                validate: (value) => isValidPhone(String(value)) || t("phoneInvalid"),
              }}
              render={({ field: bound }) => (
                <PhoneField
                  id="field-phone"
                  value={typeof bound.value === "string" ? bound.value : ""}
                  onChange={bound.onChange}
                  onBlur={bound.onBlur}
                  hasError={!!errors.phone}
                />
              )}
            />
          </FormField>
          <FormField
            label={t("labels.email")}
            htmlFor="field-email"
            required
            error={errors.email?.message}
          >
            <input
              id="field-email"
              type="email"
              dir="ltr"
              className={controlClass}
              {...register("email", {
                required: t("required"),
                pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: t("emailInvalid") },
              })}
            />
          </FormField>
          <FormField label={t("labels.notes")} htmlFor="field-notes" className="sm:col-span-2">
            <textarea
              id="field-notes"
              rows={3}
              placeholder={t("notesPlaceholder")}
              className={cn(controlClass, "resize-none")}
              {...register("notes")}
            />
          </FormField>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
          {formError}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
        <p className="text-xs leading-6 text-sand-500">{t("submitNote")}</p>
      </div>
    </form>
  );
}
