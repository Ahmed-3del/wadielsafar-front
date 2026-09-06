import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rail } from "@/components/ui/Rail";
import { railCardClass } from "@/components/ui/railCard";
import { Reveal } from "@/components/ui/Reveal";
import { PackageCard } from "./PackageCard";
import { getFeaturedPackages } from "@/lib/api/packages";
import { safeResults } from "@/lib/api/client";

/*
 * Shown to someone who came to design a trip from scratch. Plenty of them are
 * really just looking for a starting point, and an existing itinerary they can
 * ask us to change is a far shorter route to a booking than a blank form.
 *
 * Renders nothing when there are no packages: an empty state here would be an
 * apology in the middle of a page that is doing fine without it.
 */
export async function ReadyMadeRail() {
  const [t, tPackages, packages] = await Promise.all([
    getTranslations("PackagePlanPage.readymade"),
    getTranslations("Packages"),
    safeResults(getFeaturedPackages()),
  ]);

  if (packages.length === 0) return null;

  return (
    <Section className="bg-sand-50">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("title")} description={t("description")} />
          <Link
            href="/packages"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {tPackages("viewAll")}
          </Link>
        </div>

        <Reveal className="mt-6 sm:mt-10">
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
      </Container>
    </Section>
  );
}
