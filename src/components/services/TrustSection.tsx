import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { GlobeIcon, HeadsetIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/*
 * Every claim here is verifiable from the company's own published information —
 * 70+ destinations, support across the whole trip, and the commercial registry
 * number. No invented customer counts, awards or ratings.
 */
const ITEMS = [
  { key: "destinations", Icon: GlobeIcon },
  { key: "support", Icon: HeadsetIcon },
  { key: "team", Icon: UsersIcon },
  { key: "licensed", Icon: ShieldIcon },
] as const;

export async function TrustSection() {
  const t = await getTranslations("Trust");

  return (
    <Section className="relative overflow-hidden bg-navy-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_20%_0%,var(--color-gold-500),transparent_55%)]"
      />
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2.5 text-base leading-7 text-navy-100 sm:mt-4 sm:leading-8">
            {t("description")}
          </p>
        </div>

        {/* Four short facts. Stacked as four full-width blocks they ran to
            more than a screen on a phone, so on a phone the icon sits beside
            its text instead of above it — the same content in half the height.
            From sm up it is the original column again. */}
        <div className="mt-8 grid gap-x-8 gap-y-7 sm:mt-12 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }, index) => (
            <Reveal key={key} delay={index * 70}>
              <div className="flex flex-row items-start gap-4 sm:flex-col">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-400 ring-1 ring-white/15">
                  <Icon className="h-6 w-6" />
                </span>
                {/* `contents` from sm up, so the desktop column is the one
                    flex context it always was and the gap-4 between icon,
                    title and body is unchanged. */}
                <div className="flex flex-col gap-1.5 sm:contents">
                  <h3 className="text-lg font-bold text-white">{t(`items.${key}.title`)}</h3>
                  <p className="text-sm leading-7 text-navy-100">
                    {t(`items.${key}.body`, { cr: siteConfig.registration.commercialRegistry })}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
