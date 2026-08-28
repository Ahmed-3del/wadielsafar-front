"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Stepper } from "@/components/ui/Stepper";
import { FormField, controlClass } from "@/components/forms/FormField";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { createInquiry } from "@/lib/api/inquiries";
import { PhoneField } from "@/components/forms/PhoneField";
import { isValidPhone, normalizePhone } from "@/lib/utils/phone";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";

export interface VisaBookingContext {
  visaId: number;
  country: string;
  visaType: string;
  price: string;
  processingDays: number;
}

/** Cities where applications are lodged — biometrics happen in person. */
const APPOINTMENT_CITIES = ["riyadh", "jeddah", "dammam"] as const;
type AppointmentCity = (typeof APPOINTMENT_CITIES)[number];

interface WizardState {
  travelDate: string;
  city: AppointmentCity | "";
  applicants: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const INITIAL: WizardState = {
  travelDate: "",
  city: "",
  applicants: "1",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

/*
 * Three-step visa application, modelled on the flow Saudi travellers already
 * know from other visa services: trip details, applicant details, then review.
 *
 * The third step is a review rather than a payment step. Wadi Al Safar takes no
 * card payments yet, and showing a payment screen we cannot honour would be a
 * lie — fees are settled with an agent once the file is checked.
 */
export function VisaBookingWizard({ context }: { context: VisaBookingContext }) {
  const t = useTranslations("VisaBooking");
  const tRequest = useTranslations("RequestForm");
  const locale = useLocale() as Locale;
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { waUrl: string; degraded: boolean }>(null);

  const steps = [t("steps.trip"), t("steps.applicants"), t("steps.review")];
  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const stepOneValid = Boolean(state.travelDate && state.city);
  const stepTwoValid =
    Boolean(state.name.trim()) &&
    isValidPhone(state.phone) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email);

  function buildSummary() {
    const cityLabel = state.city ? t(`cities.${state.city}`) : "";
    return [
      t("waIntro", { visa: `${context.visaType} — ${context.country}` }),
      `• ${t("labels.travelDate")}: ${formatDate(state.travelDate, locale)}`,
      `• ${t("labels.city")}: ${cityLabel}`,
      `• ${t("labels.applicants")}: ${state.applicants}`,
      `• ${tRequest("labels.name")}: ${state.name}`,
      state.notes ? `• ${tRequest("labels.notes")}: ${state.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function handleSubmit() {
    setSubmitting(true);
    const waUrl = whatsappLink(buildSummary());
    let degraded = false;

    try {
      await createInquiry({
        name: state.name,
        email: state.email,
        phone: normalizePhone(state.phone),
        service_type: "VISA",
        destination: null,
        travel_date: state.travelDate || null,
        message: state.notes,
        source: "WEBSITE",
        details: {
          visa_country: context.country,
          visa_type: context.visaType,
          visa_fee: formatPrice(context.price, locale),
          appointment_city: state.city ? t(`cities.${state.city}`) : "",
          applicants: state.applicants,
          travel_date: state.travelDate,
        },
      });
    } catch {
      // A failed save must not cost the lead — the applicant still gets the
      // WhatsApp handoff, and we say plainly that it did not save.
      degraded = true;
    }

    setSubmitting(false);
    setSubmitted({ waUrl, degraded });
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-600">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-navy-900">{t("successTitle")}</h2>
        <p className="mt-2 text-sm leading-7 text-sand-600">{t("successBody")}</p>
        {submitted.degraded ? (
          <p className="mt-3 text-xs text-danger-600">{tRequest("successDegraded")}</p>
        ) : null}
        <a
          href={submitted.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants("whatsapp", "lg"), "mt-6")}
        >
          <WhatsAppIcon className="h-5 w-5" />
          {tRequest("continueOnWhatsapp")}
        </a>
      </div>
    );
  }

  return (
    <div>
      <Stepper steps={steps} current={step} className="mb-8" />

      {step === 0 ? (
        <div className="space-y-6">
          <Card title={t("tripDateTitle")} note={t("tripDateNote")}>
            <Calendar
              value={state.travelDate}
              onChange={(iso) => { set("travelDate", iso); }}
              label={t("tripDateTitle")}
            />
          </Card>

          <Card title={t("cityTitle")} note={t("cityNote")}>
            <div className="grid gap-3 sm:grid-cols-3">
              {APPOINTMENT_CITIES.map((city) => {
                const active = state.city === city;
                return (
                  <button
                    key={city}
                    type="button"
                    aria-pressed={active}
                    onClick={() => { set("city", city); }}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-start text-base font-semibold transition-colors",
                      active
                        ? "border-gold-500 bg-gold-50 text-navy-900"
                        : "border-sand-200 text-navy-900 hover:border-navy-300",
                    )}
                  >
                    {t(`cities.${city}`)}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                        active ? "border-gold-500 bg-gold-500" : "border-sand-300",
                      )}
                    >
                      {active ? <CheckIcon className="h-3 w-3 text-navy-900" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      ) : null}

      {step === 1 ? (
        <Card title={t("applicantsTitle")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("labels.applicants")} htmlFor="applicants" required>
              <select
                id="applicants"
                className={controlClass}
                value={state.applicants}
                onChange={(e) => { set("applicants", e.target.value); }}
              >
                {Array.from({ length: 9 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={tRequest("labels.name")} htmlFor="name" required>
              <input
                id="name"
                className={controlClass}
                value={state.name}
                onChange={(e) => { set("name", e.target.value); }}
              />
            </FormField>
            <FormField
              label={tRequest("labels.phone")}
              htmlFor="phone"
              required
              hint={tRequest("phoneHint")}
            >
              <PhoneField
                id="phone"
                value={state.phone}
                onChange={(next) => { set("phone", next); }}
              />
            </FormField>
            <FormField label={tRequest("labels.email")} htmlFor="email" required>
              <input
                id="email"
                type="email"
                dir="ltr"
                className={controlClass}
                value={state.email}
                onChange={(e) => { set("email", e.target.value); }}
              />
            </FormField>
            <FormField label={tRequest("labels.notes")} htmlFor="notes" className="sm:col-span-2">
              <textarea
                id="notes"
                rows={3}
                className={cn(controlClass, "resize-none")}
                placeholder={tRequest("notesPlaceholder")}
                value={state.notes}
                onChange={(e) => { set("notes", e.target.value); }}
              />
            </FormField>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card title={t("reviewTitle")} note={t("noPaymentNote")}>
          <dl className="divide-y divide-sand-200">
            {[
              { label: t("labels.country"), value: context.country },
              { label: t("labels.visaType"), value: context.visaType },
              { label: t("labels.fee"), value: formatPrice(context.price, locale) },
              {
                label: t("labels.processing"),
                value: t("daysValue", { days: context.processingDays }),
              },
              { label: t("labels.travelDate"), value: formatDate(state.travelDate, locale) },
              { label: t("labels.city"), value: state.city ? t(`cities.${state.city}`) : "" },
              { label: t("labels.applicants"), value: state.applicants },
              { label: tRequest("labels.name"), value: state.name },
              { label: tRequest("labels.phone"), value: state.phone },
              { label: tRequest("labels.email"), value: state.email },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-sand-500">{row.label}</dt>
                <dd className="text-end text-sm font-semibold text-navy-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <Button variant="outline" size="lg" onClick={() => { setStep((s) => s - 1); }}>
            {t("back")}
          </Button>
        ) : (
          <span />
        )}

        {step < 2 ? (
          <Button
            size="lg"
            disabled={step === 0 ? !stepOneValid : !stepTwoValid}
            onClick={() => { setStep((s) => s + 1); }}
          >
            {t("continue")}
          </Button>
        ) : (
          <Button size="lg" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? tRequest("submitting") : t("submit")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
      {note ? (
        <p className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-sm leading-6 text-navy-700">
          {note}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
