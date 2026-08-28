import { getTranslations } from "next-intl/server";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "./TestimonialCard";
import { getTestimonials } from "@/lib/api/testimonials";
import { safeResults } from "@/lib/api/client";

export async function Testimonials() {
  const [t, testimonials] = await Promise.all([
    getTranslations("Testimonials"),
    safeResults(getTestimonials({ page_size: 3 })),
  ]);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        {testimonials.length > 0 ? (
          <ScrollGrid
            label={t("title")}
            gridClassName="sm:grid-cols-2 lg:grid-cols-3"
            className="mt-10"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </ScrollGrid>
        ) : (
          <p className="mt-10 text-center text-sand-500">{t("empty")}</p>
        )}
      </Container>
    </Section>
  );
}
