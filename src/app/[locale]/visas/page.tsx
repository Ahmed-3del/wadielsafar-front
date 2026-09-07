import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { VisaExplorer } from "@/components/visas/VisaExplorer";
import { VisaSteps } from "@/components/visas/VisaSteps";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { toRequestFields } from "@/features/requests/fields";
import { getInquiryFields } from "@/lib/api/inquiry-fields";
import { getVisaCountries, getVisaTypes } from "@/lib/api/visas";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import { VISA_PURPOSES, type VisaPurpose } from "@/types/visa";
import type { Locale } from "@/i18n/routing";

/* The widget sends lowercase words; the model stores upper-case choices. An
 * unknown value falls back to no filter rather than hiding every visa. */
function toPurpose(value: string | undefined): VisaPurpose | undefined {
  const upper = value?.toUpperCase();
  return VISA_PURPOSES.includes(upper as VisaPurpose) ? (upper as VisaPurpose) : undefined;
}

interface VisasPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ country?: string; purpose?: string }>;
}

export async function generateMetadata({ params }: VisasPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VisasPage" });
  return { title: t("title"), description: t("description") };
}

export default async function VisasPage({ params, searchParams }: VisasPageProps) {
  const { locale } = await params;
  const { country, purpose } = await searchParams;
  setRequestLocale(locale);

  const [t, tVisas, tForm, visas, countries, hero, inquiryFields] = await Promise.all([
    getTranslations("VisasPage"),
    getTranslations("Visas"),
    getTranslations("RequestForm"),
    safeResults(getVisaTypes({ page: 1 })),
    safeResults(getVisaCountries({ page_size: 60 })),
    getPageHero("visas").catch(() => null),
      safeResults(getInquiryFields({ service_type: "VISA" })),
  ]);

  /*
   * What the traveller already told the homepage, used to fill in the matching
   * questions rather than repeated beside them. The country and the purpose
   * are rows on this form now, so passing them as fixed context as well would
   * have asked twice and answered once.
   */
  const isArabic = locale === "ar";
  const chosenPurpose = toPurpose(purpose);
  const chosenCountry = countries.find((row) => String(row.id) === country);
  const defaults: Record<string, string> = {};
  if (chosenCountry) {
    defaults.visa_country = isArabic ? chosenCountry.name_ar : chosenCountry.name_en;
  }
  if (chosenPurpose) defaults.purpose = tVisas(`purposes.${chosenPurpose}`);

  // What to ask for this service, as the panel defines it.
  const requestFields = toRequestFields(inquiryFields, isArabic);

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("headline")} description={t("description")} />

      {/* The form first, as on flights, hotels and cruises. A visa is quoted
          from the country, the purpose and the traveller count — the explorer
          below is for someone who wants to read the requirements first. */}
      <Section>
        <Container className="max-w-4xl">
          <ServiceRequestForm
            serviceType="VISA"
            fields={requestFields}
            defaults={defaults}
            title={t("formTitle")}
            notice={Object.keys(defaults).length > 0 ? tForm("prefilledNotice") : undefined}
          />
        </Container>
      </Section>

      <Section className="bg-sand-50">
        <Container>
          <VisaExplorer
            visas={visas}
            countries={countries}
            initialCountry={country}
            initialPurpose={toPurpose(purpose)}
          />
        </Container>
      </Section>
      <VisaSteps />
    </>
  );
}
