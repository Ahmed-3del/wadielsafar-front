import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClockIcon, HeadsetIcon, ShieldIcon } from "@/components/ui/icons";

const ITEMS = [
  { key: "reply", Icon: ClockIcon },
  { key: "human", Icon: HeadsetIcon },
  { key: "noCharge", Icon: ShieldIcon },
] as const;

/*
 * Shown under every request form. A form that submits into silence is the main
 * reason people abandon enquiry-based travel sites, so this sets expectations
 * about what happens next — and states plainly that submitting costs nothing.
 */
export async function ServiceAssurance() {
  const t = await getTranslations("Assurance");

  return (
    <Section className="bg-sand-50">
      <Container>
        <div className="grid gap-8 sm:grid-cols-3">
          {ITEMS.map(({ key, Icon }, index) => (
            <Reveal key={key} delay={index * 70}>
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-navy-700 shadow-xs">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-navy-900">{t(`items.${key}.title`)}</h3>
                  <p className="mt-1 text-sm leading-7 text-sand-600">{t(`items.${key}.body`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
