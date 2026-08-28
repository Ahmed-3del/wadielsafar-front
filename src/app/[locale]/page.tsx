import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { ServicesGrid } from "@/components/services/ServicesGrid";
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

  return (
    <>
      {/* Order follows the customer's decision path: what can I book (Hero,
          Services) → what can I afford (Explorer) → where could I go
          (Destinations) → what does it cost (Packages, Offers) → the one
          service people arrive specifically for (Visas) → can I trust them
          (Trust, Testimonials) → act (FinalCta).

          The explorer comes before the destination and package rails on
          purpose: those show trips and leave the reader to check prices one at
          a time, which is the question backwards. */}
      <Hero />
      <ServicesGrid />
      <BudgetExplorer />
      <PopularDestinations />
      <FeaturedPackages />
      <FeaturedOffers />
      <VisaSection />
      <FeaturedCruises />
      <TrustSection />
      <PartnersWall />
      <Testimonials />
      <FinalCta />
    </>
  );
}
