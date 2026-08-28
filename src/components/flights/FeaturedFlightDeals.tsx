import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FlightCard } from "./FlightCard";
import { getFeaturedFlightDeals } from "@/lib/api/flights";
import { safeArray } from "@/lib/api/client";

/*
 * عروض الطيران — the BRD asks for flight offers on this page alongside the
 * request form, not instead of it: browsing is what makes someone request.
 * Renders nothing at all when there are no deals, rather than an empty state,
 * because the request form below is the page's real purpose.
 */
export async function FeaturedFlightDeals() {
  const [t, deals] = await Promise.all([
    getTranslations("Flights"),
    safeArray(getFeaturedFlightDeals()),
  ]);

  if (deals.length === 0) return null;

  return (
    <Section className="bg-sand-50">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("dealsTitle")} description={t("dealsDescription")} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, index) => (
            <Reveal key={deal.id} delay={Math.min(index, 5) * 60}>
              <FlightCard flight={deal} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
