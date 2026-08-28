import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { OfferCard } from "@/components/offers/OfferCard";
import { getOffers } from "@/lib/api/offers";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface OffersPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: OffersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OffersPage" });
  return { title: t("title"), description: t("description") };
}

export default async function OffersPage({ params }: OffersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tOffers, offers, hero] = await Promise.all([
    getTranslations("OffersPage"),
    getTranslations("Offers"),
    safeResults(getOffers()),
    getPageHero("offers").catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      />

      <Section>
        <Container>
          {offers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <p className="text-sand-500">{tOffers("empty")}</p>
          )}
        </Container>
      </Section>
    </>
  );
}
