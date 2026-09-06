import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBand } from "@/components/search/SearchBand";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { SavingsSection } from "@/components/savings/SavingsSection";
import { BudgetExplorer } from "@/components/explorer/BudgetExplorer";
import { FeaturedOffers } from "@/components/offers/FeaturedOffers";
import { PopularDestinations } from "@/components/destinations/PopularDestinations";
import { FeaturedPackages } from "@/components/packages/FeaturedPackages";
import { VisaSection } from "@/components/visas/VisaSection";
import { FeaturedCruises } from "@/components/cruises/FeaturedCruises";
import { TrustSection } from "@/components/services/TrustSection";
import { PartnersWall } from "@/components/partners/PartnersWall";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { FinalCta } from "@/components/layout/FinalCta";
import { resolveHomeSections } from "@/lib/api/resolve-home-sections";
import type { HomeSectionKey } from "@/types/home-section";
import type { Locale } from "@/i18n/routing";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

// No page-level `title` here on purpose: the layout's `title.default` already
// carries the full brand phrase, and applying the "%s | Wadi Al Safar"
// template on top of it would double the brand name.
export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { description: t("description") };
}

/*
 * Every block the homepage can show, keyed to what the panel calls it.
 *
 * The search band is not in here: it carries the tabs, the results and the
 * cross-sell, which is the point of the page, so it is always first and
 * cannot be switched off. The order and
 * the on/off state of everything else are an editorial decision, not a
 * deployment — see apps/pages HomeSection.
 */
const SECTIONS: Record<HomeSectionKey, () => ReactNode> = {
  SERVICES: () => <ServicesGrid />,
  SAVINGS: () => <SavingsSection />,
  EXPLORER: () => <BudgetExplorer />,
  DESTINATIONS: () => <PopularDestinations />,
  PACKAGES: () => <FeaturedPackages />,
  OFFERS: () => <FeaturedOffers />,
  VISAS: () => <VisaSection />,
  CRUISES: () => <FeaturedCruises />,
  TRUST: () => <TrustSection />,
  PARTNERS: () => <PartnersWall />,
  TESTIMONIALS: () => <Testimonials />,
  CTA: () => <FinalCta />,
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sections = await resolveHomeSections();

  return (
    <>
      <SearchBand />
      {/* Fragment, not a wrapper div: each section owns its own full-bleed
          background, and an extra block element between them and the page
          would be one more thing to keep out of the way. */}
      {sections.map((key) => (
        <Fragment key={key}>{SECTIONS[key]()}</Fragment>
      ))}
    </>
  );
}
