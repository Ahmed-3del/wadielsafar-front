import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { CruiseCard } from "./CruiseCard";
import { getFeaturedCruises } from "@/lib/api/cruises";
import { safeArray } from "@/lib/api/client";

/** Homepage cruises block — BRD §6 lists الكروزات among the homepage sections. */
export async function FeaturedCruises() {
  const [t, cruises] = await Promise.all([
    getTranslations("Cruises"),
    safeArray(getFeaturedCruises()),
  ]);

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link
            href="/cruises"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {t("viewAll")}
          </Link>
        </div>

        {cruises.length > 0 ? (
          <Reveal className="mt-10">
            <Rail label={t("title")}>
              {cruises.map((cruise) => (
                <CruiseCard
                  key={cruise.id}
                  cruise={cruise}
                  className="w-[80vw] shrink-0 snap-start sm:w-72 lg:w-80"
                />
              ))}
            </Rail>
          </Reveal>
        ) : (
          <EmptyState
            title={t("empty")}
            className="mt-10"
            action={
              <Link href="/contact" className={buttonVariants("primary", "md")}>
                {t("requestCruise")}
              </Link>
            }
          />
        )}
      </Container>
    </Section>
  );
}
