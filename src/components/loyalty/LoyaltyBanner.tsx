import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { CheckIcon, ExternalLinkIcon, GiftIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/*
 * The loyalty programme lives on Orbit, not on this site — sign-in, joining,
 * and adding the card to Apple/Google Wallet all already work there. This
 * section's only job is to make sure a visitor actually notices it exists,
 * so it gets a full band of its own rather than a quiet line in the footer.
 *
 * The card on the left is illustrative, not a real member's — a sample points
 * balance, explicitly labelled as an example, so it reads as "here is what
 * yours will look like" rather than as anyone's real account.
 */
const EXAMPLE_POINTS = 12450;

export async function LoyaltyBanner() {
  const [t, tBrand] = await Promise.all([
    getTranslations("Loyalty"),
    getTranslations("Brand"),
  ]);

  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  return (
    <Section className="relative overflow-hidden bg-navy-900">
      {/* Ambient glow behind the card. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl"
      />

      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-1 flex justify-center lg:order-1">
          <a
            href={siteConfig.orbitLoyaltyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("cta")}
            className="group relative block w-full max-w-sm"
          >
            <div
              className={[
                "relative aspect-[85/54] w-full rounded-3xl border border-gold-500/30",
                "bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 p-6 sm:p-7",
                "shadow-xl transition-transform duration-500 ease-out-soft",
                "-rotate-3 group-hover:rotate-0",
              ].join(" ")}
            >
              {/* Sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/[0.06] to-white/0"
              />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  {/* Chip */}
                  <div className="h-7 w-10 rounded-md bg-gradient-to-br from-gold-300 to-gold-600 shadow-inner sm:h-8 sm:w-11" />
                  <GiftIcon className="h-6 w-6 text-gold-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                    {t("cardEyebrow")}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                    {tBrand("name")}
                  </p>

                  {/* A sample balance, not a real one - see the file comment. */}
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-gold-400 sm:text-3xl">
                      {EXAMPLE_POINTS.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs font-medium text-white/50">
                      {t("cardPointsUnit")}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/40">{t("cardPointsCaption")}</p>
                </div>

                <div className="flex items-end justify-between">
                  <p className="text-sm font-semibold text-white/90">{t("cardTier")}</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                    {t("cardCta")}
                  </p>
                </div>
              </div>
            </div>
          </a>
        </Reveal>

        <Reveal delay={80} className="order-2 lg:order-2">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
            tone="onDark"
          />

          <ul className="mt-6 flex flex-col gap-3 sm:mt-8">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-500/15">
                  <CheckIcon className="h-3.5 w-3.5 text-gold-400" />
                </span>
                <span className="text-base text-white/80">{bullet}</span>
              </li>
            ))}
          </ul>

          <a
            href={siteConfig.orbitLoyaltyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants("primary", "lg") + " mt-8"}
          >
            {t("cta")}
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </Reveal>
      </Container>
    </Section>
  );
}
