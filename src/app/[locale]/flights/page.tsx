import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { ServiceAssurance } from "@/components/services/ServiceAssurance";
import { HowItWorks } from "@/components/services/HowItWorks";
import { FaqSection } from "@/components/ui/FaqSection";
import { FeaturedFlightDeals } from "@/components/flights/FeaturedFlightDeals";
import { toRequestFields } from "@/features/requests/fields";
import { getInquiryFields } from "@/lib/api/inquiry-fields";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface FlightsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    from?: string;
    search?: string;
    depart?: string;
    return?: string;
    pax?: string;
  }>;
}

export async function generateMetadata({ params }: FlightsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FlightsPage" });
  return { title: t("title"), description: t("description") };
}

export default async function FlightsPage({ params, searchParams }: FlightsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const [t, tForm, hero, inquiryFields] = await Promise.all([
    getTranslations("FlightsPage"),
    getTranslations("RequestForm"),
    getPageHero("flights").catch(() => null),
      safeResults(getInquiryFields({ service_type: "FLIGHT" })),
  ]);

  // The hero widget hands its answers over as query params so the traveller
  // never re-types what they already told us.
  const defaults: Record<string, string> = {};
  if (query.from) defaults.from = query.from;
  if (query.search) defaults.to = query.search;
  if (query.depart) defaults.depart = query.depart;
  if (query.return) defaults.return = query.return;
  if (query.pax) defaults.passengers = query.pax;

  const steps = (["send", "options", "issue"] as const).map((id) => ({
    id,
    title: t(`how.steps.${id}.title`),
    body: t(`how.steps.${id}.body`),
  }));

  const faqItems = (["cost", "reply", "change", "multicity"] as const).map((id) => ({
    id,
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`),
  }));

  const arrivedFromSearch = Object.keys(defaults).length > 0;

  // What to ask for this service, as the panel defines it. An
  // unreachable API leaves the contact half of the form, which still
  // reaches an agent.
  const requestFields = toRequestFields(inquiryFields, locale === "ar");

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("title")} description={t("description")} />

      {/* The request form comes first. Someone arriving from the homepage
          search has already told us where they want to go; burying the form
          under a wall of deals means the one who finds nothing matching does
          not know there is anything below to scroll to. */}
      <Section>
        <Container className="max-w-4xl">
          <ServiceRequestForm
            serviceType="FLIGHT"
            fields={requestFields}
            defaults={defaults}
            title={t("formTitle")}
            notice={arrivedFromSearch ? tForm("prefilledNotice") : undefined}
          />
        </Container>
      </Section>

      {/* Suggestions, once the ask is out of the way. */}
      <FeaturedFlightDeals />
      <HowItWorks
        title={t("how.title")}
        description={t("how.description")}
        steps={steps}
        className="bg-white"
      />
      <FaqSection title={t("faq.title")} items={faqItems} />
      <ServiceAssurance />
    </>
  );
}
