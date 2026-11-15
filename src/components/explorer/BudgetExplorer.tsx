import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BudgetExplorerPanel } from "./BudgetExplorerPanel";
import { getPackages } from "@/lib/api/packages";
import { safeResults } from "@/lib/api/client";
import { budgetBounds } from "@/features/package-discovery";

const STEP = 500;

/*
 * "Where can you go for X?" — the one question a traveller arrives with that
 * the rest of the homepage answers backwards, by showing trips and leaving
 * them to check the prices one at a time.
 *
 * The catalogue is fetched once on the server and filtered in the browser.
 * Renders nothing when there is nothing to filter: an explorer over an empty
 * catalogue is worse than no explorer.
 */
export async function BudgetExplorer() {
  const [t, packages] = await Promise.all([
    getTranslations("Explorer"),
    safeResults(getPackages({ page_size: 60 })),
  ]);

  if (packages.length === 0) return null;

  const { min, max } = budgetBounds(packages, STEP);

  return (
    // Tighter than a standard section on a phone: someone dragging the
    // slider needs to see the packages change underneath it, so the heading,
    // the filters and the first row of cards all have to fit one screen.
    <Section className="bg-sand-50 py-6 sm:py-16 lg:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          className="[&_h2]:max-sm:text-xl [&>p:last-child]:max-sm:hidden"
        />
        <div className="mt-3 sm:mt-10">
          <BudgetExplorerPanel packages={packages} min={min} max={max} step={STEP} />
        </div>
      </Container>
    </Section>
  );
}
