import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { VisaExplorer } from "@/components/visas/VisaExplorer";
import { VisaSteps } from "@/components/visas/VisaSteps";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { VISA_FIELDS } from "@/features/requests/fields";
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

  const [t, tVisas, tForm, visas, countries, hero] = await Promise.all([
    getTranslations("VisasPage"),
    getTranslations("Visas"),
    getTranslations("RequestForm"),
    safeResults(getVisaTypes({ page: 1 })),
    safeResults(getVisaCountries({ page_size: 60 })),
    getPageHero("visas").catch(() => null),
  ]);

  /*
   * What the traveller already told the homepage, carried across as fixed
   * context rather than as editable fields: they answered these questions on
   * the way here, and an agent needs the answers to quote. Anything the
   * catalogue cannot resolve is simply left out.
   */
  const isArabic = locale === "ar";
  const chosenPurpose = toPurpose(purpose);
  const chosenCountry = countries.find((row) => String(row.id) === country);
  const context = [
    chosenCountry
      ? {
          key: "country",
          label: tVisas("countryLabel"),
          value: isArabic ? chosenCountry.name_ar : chosenCountry.name_en,
        }
      : null,
    chosenPurpose
      ? { key: "purpose", label: tVisas("purposeLabel"), value: tVisas(`purposes.${chosenPurpose}`) }
      : null,
  ].filter((entry) => entry !== null);

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
            fields={VISA_FIELDS}
            context={context}
            title={t("formTitle")}
            notice={context.length > 0 ? tForm("prefilledNotice") : undefined}
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
