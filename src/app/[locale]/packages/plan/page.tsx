import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { ServiceAssurance } from "@/components/services/ServiceAssurance";
import { HowItWorks } from "@/components/services/HowItWorks";
import { FaqSection } from "@/components/ui/FaqSection";
import { PlanIncludes } from "@/components/packages/PlanIncludes";
import { ReadyMadeRail } from "@/components/packages/ReadyMadeRail";
import { buttonVariants } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { PACKAGE_PLAN_FIELDS } from "@/features/requests/fields";
import { getDestinations } from "@/lib/api/destinations";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

/* Guarded against arbitrary query values: an unknown band would select
 * nothing and silently blank the field. */
const BUDGET_BANDS = new Set(["under5k", "5to10k", "10to20k", "over20k"]);

interface PackagePlanPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ destination?: string; budget?: string; travel_date?: string }>;
}

export async function generateMetadata({ params }: PackagePlanPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PackagePlanPage" });
  return { title: t("title"), description: t("description") };
}

export default async function PackagePlanPage({ params, searchParams }: PackagePlanPageProps) {
  const { locale } = await params;
  const { destination, budget, travel_date: travelDate } = await searchParams;
  setRequestLocale(locale);

  const [t, destinations, hero] = await Promise.all([
    getTranslations("PackagePlanPage"),
    safeResults(getDestinations({ page_size: 60 })),
    getPageHero("packages").catch(() => null),
  ]);

  // Arriving from a destination page or the hero widget should carry the
  // destination across rather than asking for it twice.
  //
  // What arrives is a slug. Printed as it is, an Arabic form opens with
  // "dubai" in the destination box, so the catalogue is asked for the name
  // this reader would have typed; an unknown slug falls back to itself with
  // the hyphens opened out.
  const defaults: Record<string, string> = {};
  if (destination) {
    const match = destinations.find((row) => row.slug === destination);
    defaults.destination = match
      ? (locale === "ar" ? match.name_ar : match.name_en)
      : destination.replace(/-/g, " ");
  }
  // Carried over when the homepage explorer found nothing in someone's range —
  // they have already told us the number once.
  if (budget && BUDGET_BANDS.has(budget)) defaults.budget = budget;
  // Only an ISO date the date input can actually display.
  if (travelDate && /^\d{4}-\d{2}-\d{2}$/.test(travelDate)) defaults.travel_date = travelDate;

  const facts = (["noFee", "agent", "whatsapp"] as const).map((key) => (
    <span key={key} className="flex items-center gap-2">
      <CheckIcon className="h-4 w-4 text-gold-400" />
      {t(`facts.${key}`)}
    </span>
  ));

  const steps = (["brief", "design", "refine", "confirm"] as const).map((id) => ({
    id,
    title: t(`how.steps.${id}.title`),
    body: t(`how.steps.${id}.body`),
  }));

  const faqItems = (["cost", "budget", "time", "group"] as const).map((id) => ({
    id,
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`),
  }));

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
        facts={facts}
      >
        {/* Someone who already knows what they want should not have to scroll
            past the explanation to reach the form. */}
        <a href="#plan-form" className={buttonVariants("primary", "lg")}>
          {t("startCta")}
        </a>
      </PageHeader>

      <HowItWorks title={t("how.title")} description={t("how.description")} steps={steps} />

      <Section id="plan-form" className="scroll-mt-24">
        <Container className="max-w-4xl">
          <ServiceRequestForm
            serviceType="PACKAGE"
            fields={PACKAGE_PLAN_FIELDS}
            defaults={defaults}
            title={t("formTitle")}
          />
        </Container>
      </Section>

      <PlanIncludes />
      <ReadyMadeRail />
      <FaqSection title={t("faq.title")} items={faqItems} />
      <ServiceAssurance />
    </>
  );
}
