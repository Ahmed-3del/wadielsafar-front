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
import type { InquiryServiceType } from "@/types/inquiry-service-type";
import type { ServiceType } from "@/types/inquiry";
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
  /** The services on offer, in the panel's order. Empty falls back to the six
   *  an enquiry can be filed under, named from the message catalogue. */
  serviceTypes?: InquiryServiceType[];
  /** What the visitor pressed to get here. The form opens on it. Narrowed
   *  against the offered list before it reaches here. */
  initialServiceType?: ServiceType | null;
  /** The wording they pressed, when it is finer than the service — "Travel
   *  insurance" under Other. Filed with the enquiry. */
  topic?: string | null;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export function InquiryForm({
  destinations = [],
  fields = [],
  serviceTypes = [],
  initialServiceType = null,
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
      serviceTypes.length > 0
        ? serviceTypes.map((row) => ({
            value: row.value,
            label: isArabic ? row.label_ar : row.label_en,
          }))
        : SERVICE_TYPES.map((value) => ({ value, label: tServiceTypes(value) })),
    [serviceTypes, isArabic, tServiceTypes],
  );

  /*
   * Whatever the visitor pressed, or else the first thing on offer. Not a
   * constant: an entry the panel has switched off is not in the list, and a
   * picker defaulting to something it does not offer shows blank.
   */
  const defaultServiceType = initialServiceType ?? options[0]?.value ?? "OTHER";

  /*
   * The fixed half of the form is the same whatever the service; the rest is
   * whatever the panel says to ask. Required-ness comes from the rows too, so
   * the schema is rebuilt when they change rather than written out here.
   */
  const schema = useMemo(
    () =>
      inquiryFormSchema
        .extend({ details: z.record(z.string(), z.string()) })
        .superRefine((values, ctx) => {
          for (const field of fields) {
            if (field.service_type !== values.service_type || !field.is_required) continue;
            if (!values.details[field.key]?.trim()) {
              ctx.addIssue({
                code: "custom",
                path: ["details", field.key],
                message: "required",
              });
            }
          }
        }),
    [fields],
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
      service_type: defaultServiceType,
      destination: null,
      travel_date: null,
      message: "",
      details: {},
    },
  });

  // The chosen service decides which questions are on screen.
  const serviceType = useWatch({ control, name: "service_type" });
  const serviceFields = useMemo(
    () =>
      fields
        .filter((field) => field.service_type === serviceType)
        .sort((a, b) => a.order - b.order),
    [fields, serviceType],
  );

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
      // The add-ons all file under "Other", so without this the agent reads
      // "Other" and has to guess which of the eight tiles was pressed.
      if (topic) details.requested_service = topic;

      await createInquiry({ ...values, details, source: "WEBSITE" });
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
          <select id="service_type" className={fieldClass} {...register("service_type")}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {topic ? (
            /* Said out loud so the reader can see the site remembered what
               they pressed — and correct it if the tile was not what they
               meant. */
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
