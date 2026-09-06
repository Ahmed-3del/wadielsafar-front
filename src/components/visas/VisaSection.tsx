import { getTranslations } from "next-intl/server";
import { Rail } from "@/components/ui/Rail";
import { railCardClass } from "@/components/ui/railCard";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { VisaCard } from "./VisaCard";
import { getVisaTypes } from "@/lib/api/visas";
import { safeResults } from "@/lib/api/client";

export async function VisaSection() {
  const [t, visaTypes] = await Promise.all([
    getTranslations("Visas"),
    safeResults(getVisaTypes({ page: 1 })),
  ]);
  // Eight rather than three: the row scrolls now, so the limit is what a
  // reader will flick through rather than what fits across the page.
  const featured = visaTypes.slice(0, 8);

  return (
    <Section className="bg-sand-50">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link
            href="/visas"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {t("viewAll")}
          </Link>
        </div>

        {featured.length > 0 ? (
          /* One scrollable row, as the client asked: swipe on a phone, arrows
             from lg up. A three-across grid could only ever show three of the
             eighteen visas we actually sell. */
          <Reveal className="mt-6 sm:mt-10 block">
            <Rail label={t("title")}>
              {featured.map((visa) => (
                <VisaCard
                  key={visa.id}
                  visa={visa}
                  className={railCardClass}
                />
              ))}
            </Rail>
          </Reveal>
        ) : (
          <EmptyState
            title={t("empty")}
            className="mt-6 sm:mt-10"
            action={
              <Link href="/contact" className={buttonVariants("primary", "md")}>
                {t("apply")}
              </Link>
            }
          />
        )}
      </Container>
    </Section>
  );
}
