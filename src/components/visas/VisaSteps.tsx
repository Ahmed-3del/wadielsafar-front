import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = ["choose", "documents", "review", "receive"] as const;

/*
 * The application path, stated plainly. The single biggest source of anxiety in
 * visa services is not knowing what happens after you press the button, so the
 * steps are shown before the customer commits, not after.
 */
export async function VisaSteps() {
  const t = await getTranslations("VisaSteps");

  return (
    <Section className="bg-sand-50">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step} delay={index * 80}>
              <li className="relative flex flex-col gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-lg font-bold text-gold-400">
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-navy-900">{t(`steps.${step}.title`)}</h3>
                <p className="text-sm leading-7 text-sand-600">{t(`steps.${step}.body`)}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
