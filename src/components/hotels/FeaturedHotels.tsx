import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { HotelCard } from "./HotelCard";
import { getFeaturedHotels } from "@/lib/api/hotels";
import { safeArray } from "@/lib/api/client";

/*
 * عرض الفنادق والعروض — shown above the request form for the same reason as
 * the flight deals: the BRD asks for both, and seeing real stays is what
 * prompts someone to ask for a quote.
 */
export async function FeaturedHotels() {
  const [t, hotels] = await Promise.all([
    getTranslations("Hotels"),
    safeArray(getFeaturedHotels()),
  ]);

  if (hotels.length === 0) return null;

  return (
    <Section className="bg-sand-50">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("featuredTitle")} description={t("featuredDescription")} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel, index) => (
            <Reveal key={hotel.id} delay={Math.min(index, 5) * 60}>
              <HotelCard hotel={hotel} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
