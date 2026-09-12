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
import { contactHref } from "@/lib/utils/contact-link";
import { VisaCard } from "./VisaCard";
import { getFeaturedVisaTypes } from "@/lib/api/visas";
import { safeResults } from "@/lib/api/client";

export async function VisaSection() {
  // Which visas show here is an editor's pick — see VisaType.is_featured —
  // not whatever the catalogue's default ordering happened to put first.
  const [t, featured] = await Promise.all([
    getTranslations("Visas"),
    safeResults(getFeaturedVisaTypes()),
  ]);

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
              <Link href={contactHref({ service: "VISA" })} className={buttonVariants("primary", "md")}>
                {t("apply")}
              </Link>
            }
          />
        )}
      </Container>
    </Section>
  );
}
