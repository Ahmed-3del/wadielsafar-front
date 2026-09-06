import { getTranslations } from "next-intl/server";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OfferCard } from "./OfferCard";
import { getActiveOffers } from "@/lib/api/offers";
import { safeArray } from "@/lib/api/client";

export async function FeaturedOffers() {
  const [t, offers] = await Promise.all([
    getTranslations("Offers"),
    safeArray(getActiveOffers()),
  ]);

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link href="/offers" className="text-sm font-semibold text-gold-700 hover:text-gold-800">
            {t("viewAll")}
          </Link>
        </div>

        {offers.length > 0 ? (
          <ScrollGrid
            label={t("title")}
            gridClassName="sm:grid-cols-2 lg:grid-cols-4"
            className="mt-6 sm:mt-10"
          >
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </ScrollGrid>
        ) : (
          <p className="mt-6 sm:mt-10 text-sand-500">{t("empty")}</p>
        )}
      </Container>
    </Section>
  );
}
