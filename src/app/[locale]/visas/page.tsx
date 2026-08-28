import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { VisaExplorer } from "@/components/visas/VisaExplorer";
import { VisaSteps } from "@/components/visas/VisaSteps";
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

  const [t, visas, countries, hero] = await Promise.all([
    getTranslations("VisasPage"),
    safeResults(getVisaTypes({ page: 1 })),
    safeResults(getVisaCountries({ page_size: 60 })),
    getPageHero("visas").catch(() => null),
  ]);

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("headline")} description={t("description")} />
      <Section>
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
