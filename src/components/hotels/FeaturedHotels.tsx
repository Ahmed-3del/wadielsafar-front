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
        {/* Two columns from the smallest phone up. A hotel card is short
            enough now — one image, a rating, a name, a price — that a single
            column just meant more scrolling for the same six hotels. */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
