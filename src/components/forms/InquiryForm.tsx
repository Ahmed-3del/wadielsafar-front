"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { inquiryFormSchema } from "@/lib/validations/inquiry";
import { InquiryDetailFields } from "@/components/forms/InquiryDetailFields";
import type { InquiryField } from "@/types/inquiry-field";
import { createInquiry } from "@/lib/api/inquiries";
import { ApiError } from "@/lib/api/client";
import { SERVICE_TYPES } from "@/lib/constants/service-types";
import { choiceId, type ContactFormService } from "@/types/contact-form-service";
import { Button } from "@/components/ui/Button";
import { PhoneField } from "@/components/forms/PhoneField";
import { TagIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { todayIso } from "@/lib/utils/dates";
import type { Destination } from "@/types/destination";

export interface InquiryClaim {
  /** The offer's name, as the card showed it. */
  offer: string;
  /** The promo code, when the offer has one. */
  code: string;
}

interface InquiryFormProps {
  destinations?: Destination[];
  /** Set when the visitor arrived by claiming an offer. Shown on the form and
   *  filed on the enquiry, so the agent knows what was promised. */
  claim?: InquiryClaim | null;
  /** Every question the panel defines, for every service. The form shows the
   *  ones belonging to whichever service is chosen. */
  fields?: InquiryField[];
  /** What the form offers, in the panel's order: the base service types and
   *  the services switched on for the form. Empty falls back to the six an
   *  enquiry can be filed under, named from the message catalogue. */
  services?: ContactFormService[];
  /** What the visitor pressed to get here — a choice id from the list above.
   *  The form opens on it. Checked against the list before it reaches here. */
  initialChoice?: string | null;
  /** Which particular thing they were looking at — a package's or a cruise's
   *  own name. Finer than the service, and filed with the enquiry. */
  topic?: string | null;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

type Choice = { id: string; entry: ContactFormService; label: string };

/**
 * The questions one choice asks.
 *
 * A service asks its own if it has any, and otherwise falls back to the ones
 * its type asks — so switching a service on for the form never produces a page
 * that asks nothing, and a service that needs a policy start date can have one
 * without every other "Other" enquiry being asked for it too.
 */
function questionsFor(
  fields: InquiryField[],
  options: Choice[],
  choiceId: string,
): InquiryField[] {
  const entry = options.find((option) => option.id === choiceId)?.entry;
  if (!entry) return [];

  const own =
    entry.kind === "SERVICE" ? fields.filter((field) => field.service === entry.service_id) : [];
  const rows = own.length
    ? own
    : fields.filter((field) => field.service === null && field.service_type === entry.value);
  return [...rows].sort((a, b) => a.order - b.order);
}

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export function InquiryForm({
  destinations = [],
  fields = [],
  services = [],
  initialChoice = null,
  topic = null,
  claim = null,
}: InquiryFormProps) {
  const t = useTranslations("InquiryForm");
  const tServiceTypes = useTranslations("ServiceTypes");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * What the picker offers. The panel owns this list — its wording, its order,
   * and whether an entry is offered at all — so an unreachable API must not
   * leave an empty dropdown and a form nobody can send: it falls back to the
   * six values an enquiry can be filed under, named from the catalogue.
   */
  const options = useMemo(
    () =>
      services.length > 0
        ? services.map((entry) => ({
            id: choiceId(entry),
            entry,
            label: isArabic ? entry.label_ar : entry.label_en,
          }))
        : SERVICE_TYPES.map((value) => ({
            id: `TYPE:${value}`,
            entry: {
              kind: "TYPE" as const,
              value,
              service_id: null,
              slug: "",
              label_ar: "",
              label_en: "",
              order: 0,
            },
            label: tServiceTypes(value),
          })),
    [services, isArabic, tServiceTypes],
  );

  /*
   * Whatever the visitor pressed, or else the first thing on offer. Not a
   * constant: an entry the panel has switched off is not in the list, and a
   * picker defaulting to something it does not offer shows blank.
   */
  const defaultChoice = initialChoice ?? options[0]?.id ?? "TYPE:OTHER";

  /*
   * The fixed half of the form is the same whatever the service; the rest is
   * whatever the panel says to ask. Required-ness comes from the rows too, so
   * the schema is rebuilt when they change rather than written out here.
   */
  const schema = useMemo(
    () =>
      inquiryFormSchema
        .extend({ choice: z.string(), details: z.record(z.string(), z.string()) })
        .superRefine((values, ctx) => {
          for (const field of questionsFor(fields, options, values.choice)) {
            if (!field.is_required) continue;
            if (!values.details[field.key]?.trim()) {
              ctx.addIssue({
                code: "custom",
                path: ["details", field.key],
                message: "required",
              });
            }
          }
        }),
    [fields, options],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      choice: defaultChoice,
      service_type: "OTHER",
      destination: null,
      travel_date: null,
      message: "",
      details: {},
    },
  });

  // The chosen service decides which questions are on screen.
  const choice = useWatch({ control, name: "choice" });
  const serviceFields = useMemo(
    () => questionsFor(fields, options, choice),
    [fields, options, choice],
  );
  const chosen = options.find((option) => option.id === choice)?.entry ?? null;

  async function onSubmit(values: z.output<typeof schema>) {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      /*
       * Only the answers belonging to the chosen service, and only the ones
       * actually filled in: switching the picker leaves the old service's
       * answers in form state, and an agent should not receive a cruise's
       * cabin type on a visa enquiry.
       */
      const details = Object.fromEntries(
        serviceFields
          .map((field) => [field.key, values.details[field.key]?.trim() ?? ""] as const)
          .filter(([, value]) => value !== ""),
      );

      // The offer being claimed rides along with the answers, so it reaches
      // the agent on the enquiry rather than only in the visitor's memory.
      if (claim?.offer) details.claimed_offer = claim.offer;
      if (claim?.code) details.promo_code = claim.code;
      // Which package or cruise they were reading, which the service choice
      // alone does not say.
      if (topic) details.requested_service = topic;

      await createInquiry({
        ...values,
        // The picker carries one value; the enquiry stores two. `service_type`
        // is the column the panel filters and the CRM reads, `service` is
        // which of the six things filed under OTHER they actually asked for.
        service_type: chosen?.value ?? "OTHER",
        service: chosen?.kind === "SERVICE" ? chosen.service_id : null,
        details,
        source: "WEBSITE",
      });
      setStatus("success");
      reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : t("errorGeneric"));
    }
  }

  return (
    <>
      {claim ? (
        /* Said out loud, so the person filling this in can see the discount
           travelled with them — and so a wrong code is obvious before they
           send it rather than after an agent quotes without it. */
        <p className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold-500/40 bg-gold-50 px-4 py-3 text-sm text-navy-900">
          <TagIcon className="h-4 w-4 shrink-0 text-gold-700" />
          <span className="font-semibold">{t("claiming", { offer: claim.offer })}</span>
          {claim.code ? (
            <code
              dir="ltr"
              className="rounded-md border border-dashed border-gold-500/60 bg-white px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-gold-700"
            >
              {claim.code}
            </code>
          ) : null}
        </p>
      ) : null}

      <form
      onSubmit={handleSubmit(onSubmit, () => {
        /* A validation failure on a field that is off screen — or one whose
           message nothing renders — used to leave the button doing nothing at
           all. Say something rather than nothing. */
        setStatus("error");
        setErrorMessage(t("errorInvalid"));
      })} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy-900">
          {t("name")}
        </label>
        <input id="name" type="text" className={fieldClass} {...register("name")} />
        {errors.name ? <p className="mt-1 text-sm text-red-600">{t("errors.name")}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy-900">
            {t("email")}
          </label>
          <input id="email" type="email" className={fieldClass} {...register("email")} />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{t("errors.email")}</p> : null}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-navy-900">
            {t("phone")}
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneField
                id="phone"
                className="mt-1.5"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                hasError={!!errors.phone}
              />
            )}
          />
          {errors.phone ? <p className="mt-1 text-sm text-red-600">{t("errors.phone")}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service_type" className="block text-sm font-medium text-navy-900">
            {t("serviceType")}
          </label>
          <select id="service_type" className={fieldClass} {...register("choice")}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {topic ? (
            /* Said out loud so the reader can see the site remembered what
               they pressed — and correct it if it was not what they meant. */
            <p className="mt-1.5 text-sm text-sand-600">{t("about", { topic })}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="travel_date" className="block text-sm font-medium text-navy-900">
            {t("travelDate")}
          </label>
          {/* `min` greys out the impossible days in the native picker; the
              schema catches a date that was typed rather than picked. */}
          <input
            id="travel_date"
            type="date"
            min={todayIso()}
            className={fieldClass}
            {...register("travel_date", {
              setValueAs: (value: string) => (value === "" ? null : value),
            })}
          />
          {errors.travel_date ? (
            <p className="mt-1 text-sm text-red-600">{t("errors.travelDate")}</p>
          ) : null}
        </div>
      </div>

      {/* Whatever the panel says to ask for this service. Empty for a service
          with no rows, which is a decision an editor can make. */}
      <InquiryDetailFields fields={serviceFields} register={register} errors={errors} />

      {destinations.length > 0 ? (
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-navy-900">
            {t("destination")}
          </label>
          <select
            id="destination"
            className={fieldClass}
            defaultValue=""
            {...register("destination", {
              /* "No destination" arrives here as "" from the DOM and as null
                 from the form's own defaults, and Number(null) is 0 — which
                 failed .positive() on a field nobody had touched, blocking
                 the whole form with no message on screen. Anything blank is
                 null; only a real value is converted. */
              setValueAs: (value: unknown) => {
                const text = typeof value === "string" ? value.trim() : value;
                return text === "" || text === null || text === undefined ? null : Number(text);
              },
            })}
          >
            <option value=""></option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {locale === "ar" ? destination.name_ar : destination.name_en}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy-900">
          {t("message")}
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder={t("messagePlaceholder")}
          className={cn(fieldClass, "resize-none")}
          {...register("message")}
        />
        {errors.message ? <p className="mt-1 text-sm text-red-600">{t("errors.message")}</p> : null}
      </div>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? t("submitting") : t("submit")}
      </Button>

      {status === "success" ? (
        <p role="status" className="text-sm font-medium text-green-700">
          {t("success")}
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </form>
    </>
  );
}
