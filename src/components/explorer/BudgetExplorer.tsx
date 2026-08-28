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
    <Section className="bg-sand-50">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <div className="mt-10">
          <BudgetExplorerPanel packages={packages} min={min} max={max} step={STEP} />
        </div>
      </Container>
    </Section>
  );
}
