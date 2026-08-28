import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import {
  BedIcon,
  CarIcon,
  MealIcon,
  PassportIcon,
  PinIcon,
  PlaneIcon,
  ShieldIcon,
} from "@/components/ui/icons";

/*
 * Mirrors the "what to include" checkboxes in the planner form, one for one.
 * The form asks the traveller to tick services by name; this says what each of
 * those names actually buys, which is the difference between a checklist and a
 * decision.
 */
const ITEMS = [
  { key: "flights", Icon: PlaneIcon },
  { key: "hotel", Icon: BedIcon },
  { key: "transfers", Icon: CarIcon },
  { key: "tours", Icon: PinIcon },
  { key: "visa", Icon: PassportIcon },
  { key: "insurance", Icon: ShieldIcon },
  { key: "meals", Icon: MealIcon },
] as const;

export async function PlanIncludes() {
  const t = await getTranslations("PackagePlanPage.includes");

  return (
    <Section>
      <Container>
        <SectionHeading title={t("title")} description={t("description")} />
        <FeatureGrid
          className="mt-10"
          items={ITEMS.map(({ key, Icon }) => ({
            id: key,
            title: t(`items.${key}.title`),
            body: t(`items.${key}.body`),
            Icon,
          }))}
        />
      </Container>
    </Section>
  );
}
