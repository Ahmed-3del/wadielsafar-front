import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { ServiceAssurance } from "@/components/services/ServiceAssurance";
import { HowItWorks } from "@/components/services/HowItWorks";
import { FaqSection } from "@/components/ui/FaqSection";
import { FeaturedHotels } from "@/components/hotels/FeaturedHotels";
import { HOTEL_FIELDS } from "@/features/requests/fields";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface HotelsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export async function generateMetadata({ params }: HotelsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HotelsPage" });
  return { title: t("title"), description: t("description") };
}

export default async function HotelsPage({ params, searchParams }: HotelsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const [t, tForm, hero] = await Promise.all([
    getTranslations("HotelsPage"),
    getTranslations("RequestForm"),
    getPageHero("hotels").catch(() => null),
  ]);

  const defaults: Record<string, string> = {};
  // The widget sends a destination slug; it is a reasonable seed for the free
  // text field, and the traveller can correct it.
  if (query.destination) defaults.city = query.destination.replace(/-/g, " ");
  if (query.checkIn) defaults.check_in = query.checkIn;
  if (query.checkOut) defaults.check_out = query.checkOut;
  if (query.guests) defaults.guests = query.guests;

  const steps = (["tell", "shortlist", "confirm"] as const).map((id) => ({
    id,
    title: t(`how.steps.${id}.title`),
    body: t(`how.steps.${id}.body`),
  }));

  const faqItems = (["price", "breakfast", "rooms", "transfers"] as const).map((id) => ({
    id,
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`),
  }));

  const arrivedFromSearch = Object.keys(defaults).length > 0;

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
            serviceType="HOTEL"
            fields={HOTEL_FIELDS}
            defaults={defaults}
            title={t("formTitle")}
            notice={arrivedFromSearch ? tForm("prefilledNotice") : undefined}
          />
        </Container>
      </Section>

      {/* Suggestions, once the ask is out of the way. */}
      <FeaturedHotels />
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
