import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBand } from "@/components/search/SearchBand";
import { Recommendations } from "@/components/search/Recommendations";
import { SearchTabProvider } from "@/components/search/search-tab-context";
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
import { LoyaltyBanner } from "@/components/loyalty/LoyaltyBanner";
import { resolveHomeSections } from "@/lib/api/resolve-home-sections";
import { getSearchResults } from "@/lib/api/home-search";
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

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [sections, results] = await Promise.all([resolveHomeSections(), getSearchResults()]);

  /*
   * Every block the homepage can show, keyed to what the panel calls it.
   *
   * Defined here rather than at module scope so RECOMMENDATIONS — the search's
   * "you might also like" rail — can close over this request's `results`. Both
   * it and LOYALTY (the Orbit membership banner) used to be hard-coded at a
   * fixed point on the page, with no row in the panel's table and nothing an
   * editor could do about where they sat. Every section's order and on/off
   * state is an editorial decision rather than a deployment now — see
   * apps/pages HomeSection.
   *
   * The hero itself still is not in here: the search widget is the point of
   * the page, so it is always first and cannot be switched off.
   */
  const SECTIONS: Record<HomeSectionKey, () => ReactNode> = {
    RECOMMENDATIONS: () => <Recommendations results={results} />,
    LOYALTY: () => <LoyaltyBanner />,
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

  return (
    // The provider wraps the whole page, not just the search band: the
    // recommendations rail reads the open tab from here, and it is rendered
    // as one of `sections` below — a sibling of the search band, not a child.
    <SearchTabProvider>
      <SearchBand results={results} />
      {/* Fragment, not a wrapper div: each section owns its own full-bleed
          background, and an extra block element between them and the page
          would be one more thing to keep out of the way. */}
      {sections.map((key) => (
        <Fragment key={key}>{SECTIONS[key]()}</Fragment>
      ))}
    </SearchTabProvider>
  );
}
