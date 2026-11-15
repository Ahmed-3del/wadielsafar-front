import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { VisaExplorer } from "@/components/visas/VisaExplorer";
import { VisaSteps } from "@/components/visas/VisaSteps";
import { getVisaCountries, getVisaTypes } from "@/lib/api/visas";
import { safeAllResults } from "@/lib/api/client";
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

  const [t, visas, countries, hero] = await Promise.all([
    getTranslations("VisasPage"),
    // Whole catalogues, every page: the explorer filters them in the browser,
    // so anything not loaded here could never be found by its search.
    safeAllResults((paging) => getVisaTypes(paging)),
    safeAllResults((paging) => getVisaCountries(paging)),
    getPageHero("visas").catch(() => null),
  ]);

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("headline")} description={t("description")} />

      {/* The explorer straight under the header — the client dropped the
          request form that used to come first. Each visa card leads to its
          own application, which is where a request starts now. */}
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
