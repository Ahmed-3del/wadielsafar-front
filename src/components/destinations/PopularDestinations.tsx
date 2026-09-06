import { getTranslations } from "next-intl/server";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { DestinationCard } from "./DestinationCard";
import { getPopularDestinations } from "@/lib/api/destinations";
import { safeResults } from "@/lib/api/client";

export async function PopularDestinations() {
  const [t, destinations] = await Promise.all([
    getTranslations("Destinations"),
    safeResults(getPopularDestinations()),
  ]);

  const [featured, ...rest] = destinations.slice(0, 5);

  return (
    <Section className="bg-sand-50">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link
            href="/destinations"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {t("viewAll")}
          </Link>
        </div>

        {featured ? (
          /*
           * Deliberate hierarchy rather than a uniform grid: one destination
           * carries the section and the rest support it, which is what makes
           * the block feel edited instead of dumped from a database.
           */
          <div className="mt-6 sm:mt-10 grid gap-4 sm:gap-5 lg:grid-cols-2">
            <Reveal className="lg:contents">
              <DestinationCard destination={featured} featured className="lg:row-span-2" />
            </Reveal>
            {rest.length > 0 ? (
              /* The supporting cards swipe on a phone. Stacked, they turned a
                 section that is meant to be a glance into two screens of
                 scrolling before the visitor reached anything else. */
              <ScrollGrid label={t("title")} gridClassName="sm:grid-cols-2 sm:gap-5">
                {rest.map((destination, index) => (
                  <Reveal key={destination.id} delay={(index + 1) * 70}>
                    <DestinationCard destination={destination} />
                  </Reveal>
                ))}
              </ScrollGrid>
            ) : null}
          </div>
        ) : (
          <EmptyState title={t("empty")} className="mt-6 sm:mt-10" />
        )}
      </Container>
    </Section>
  );
}
