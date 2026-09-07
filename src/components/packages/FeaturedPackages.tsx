import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rail } from "@/components/ui/Rail";
import { railCardClass } from "@/components/ui/railCard";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { contactHref } from "@/lib/utils/contact-link";
import { PackageCard } from "./PackageCard";
import { getFeaturedPackages } from "@/lib/api/packages";
import { safeResults } from "@/lib/api/client";

export async function FeaturedPackages() {
  const [t, packages] = await Promise.all([
    getTranslations("Packages"),
    safeResults(getFeaturedPackages()),
  ]);

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link
            href="/packages"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {t("viewAll")}
          </Link>
        </div>

        {packages.length > 0 ? (
          <Reveal className="mt-6 sm:mt-10">
            {/* A rail rather than a grid: package counts vary, and a rail never
                leaves a half-empty final row. */}
            <Rail label={t("title")}>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
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
              <Link href={contactHref({ service: "PACKAGE" })} className={buttonVariants("primary", "md")}>
                {t("requestTrip")}
              </Link>
            }
          />
        )}
      </Container>
    </Section>
  );
}
