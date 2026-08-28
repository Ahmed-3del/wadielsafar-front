import { getTranslations } from "next-intl/server";
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
  const featured = visaTypes.slice(0, 3);

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
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((visa, index) => (
              <Reveal key={visa.id} delay={index * 70}>
                <VisaCard visa={visa} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("empty")}
            className="mt-10"
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
