"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { inquiryFormSchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { createInquiry } from "@/lib/api/inquiries";
import { ApiError } from "@/lib/api/client";
import { SERVICE_TYPES } from "@/lib/constants/service-types";
import { Button } from "@/components/ui/Button";
import { PhoneField } from "@/components/forms/PhoneField";
import { cn } from "@/lib/utils/cn";
import { todayIso } from "@/lib/utils/dates";
import type { Destination } from "@/types/destination";

interface InquiryFormProps {
  destinations?: Destination[];
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export function InquiryForm({ destinations = [] }: InquiryFormProps) {
  const t = useTranslations("InquiryForm");
  const tServiceTypes = useTranslations("ServiceTypes");
  const locale = useLocale();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service_type: "PACKAGE",
      destination: null,
      travel_date: null,
      message: "",
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      await createInquiry({ ...values, source: "WEBSITE" });
      setStatus("success");
      reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : t("errorGeneric"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {tServiceTypes(type)}
              </option>
            ))}
          </select>
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
              setValueAs: (value: string) => (value === "" ? null : Number(value)),
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
  );
}
