import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { ClockIcon, GiftIcon, TagIcon } from "@/components/ui/icons";
import { Countdown } from "./Countdown";
import { ExpiresAt } from "./ExpiresAt";
import { getPromotions } from "@/lib/api/company";
import { safeResults } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { livePromotions } from "@/lib/utils/promotions";
import { contactHref } from "@/lib/utils/contact-link";
import type { PromotionIcon } from "@/types/promotion";

const ICONS: Record<PromotionIcon, typeof TagIcon> = {
  TAG: TagIcon,
  CLOCK: ClockIcon,
  GIFT: GiftIcon,
};

/*
 * "Ways to save" — the discounts, under the add-on services, where the
 * client's feedback puts them.
 *
 * Every card is a row in the panel. A percentage, a code and a deadline are
 * commercial commitments, and the one thing this section must never do is
 * outlive the offer it advertises: an expired card is switched off in the
 * panel, and a countdown that reaches zero removes itself.
 */
export async function SavingsSection() {
  const [t, locale, promotions] = await Promise.all([
    getTranslations("Savings"),
    getLocale(),
    safeResults(getPromotions()),
  ]);

  const isArabic = locale === "ar";
  // One clock reading for the whole section: the countdown's first client
  // render is seeded from it, so the HTML and the hydrated timer agree.
  const { live, now } = livePromotions(promotions);

  if (live.length === 0) return null;

  return (
    <Section className="bg-navy-900">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          tone="onDark"
        />

        <ScrollGrid
          label={t("title")}
          gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          className="mt-6 sm:mt-10"
        >
          {live.map((promotion) => {
            const Icon = ICONS[promotion.icon] ?? TagIcon;
            const badge = isArabic ? promotion.badge_ar : promotion.badge_en;
            const title = isArabic ? promotion.title_ar : promotion.title_en;
            /*
             * Claiming has to carry the offer with it. Left as a bare link to
             * the contact form, someone clicking "claim" on WELCOME15 arrived
             * at a form that knew nothing about it — and the agent reading the
             * enquiry had no idea a discount had been promised.
             */
            const claimHref =
              promotion.link || contactHref({ offer: title, promo: promotion.code });
            const ctaLabel = (isArabic ? promotion.cta_label_ar : promotion.cta_label_en) || t("cta");

            const card = (
              <article
                className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-gold-500/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500 text-navy-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  {badge ? (
                    <span dir="ltr" className="text-3xl font-bold leading-none text-gold-400">
                      {badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-lg font-bold text-white">
                  {isArabic ? promotion.title_ar : promotion.title_en}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {isArabic ? promotion.description_ar : promotion.description_en}
                </p>

                {promotion.code ? (
                  <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
                    {t("codeLabel")}
                    <code
                      dir="ltr"
                      className="rounded-md border border-dashed border-gold-500/50 bg-gold-500/10 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-gold-300"
                    >
                      {promotion.code}
                    </code>
                  </p>
                ) : null}

                {promotion.ends_at ? (
                  <Countdown
                    endsAt={promotion.ends_at}
                    initialRemaining={new Date(promotion.ends_at).getTime() - now}
                  />
                ) : null}

                {/* Padding rather than a margin, so `mt-auto` can still push
                    the row to the foot of the card and the three buttons line
                    up whatever each card holds above them. */}
                <div className="mt-auto pt-5">
                  <Link
                    href={claimHref}
                    className={cn(buttonVariants("primary", "md"), "w-full")}
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </article>
            );

            // Wrapped only when there is a deadline to outlive. The wrapper
            // renders a fragment, so the article stays the grid's own child
            // and keeps the rail's width rules.
            return promotion.ends_at ? (
              <ExpiresAt key={promotion.id} endsAt={promotion.ends_at} expiredOnServer={false}>
                {card}
              </ExpiresAt>
            ) : (
              <Fragment key={promotion.id}>{card}</Fragment>
            );
          })}
        </ScrollGrid>
      </Container>
    </Section>
  );
}
