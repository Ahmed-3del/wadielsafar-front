import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { Badge } from "@/components/ui/Badge";
import { OfferCard } from "@/components/offers/OfferCard";
import { buttonVariants } from "@/components/ui/Button";
import { CalendarIcon, ClockIcon, TagIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getOfferBySlug, getOffers } from "@/lib/api/offers";
import { safeResults } from "@/lib/api/client";
import { formatDate } from "@/lib/utils/format-date";
import { daysUntilIso } from "@/lib/utils/dates";
import { getOfferPricing } from "@/lib/utils/pricing";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface OfferDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

/* An offer that ends this month is worth saying so about; one that runs to
   next spring is not urgent and the countdown would be noise. */
const URGENT_WITHIN_DAYS = 30;

async function fetchOffer(slug: string) {
  return fetchDetail(getOfferBySlug(slug));
}

export async function generateMetadata({ params }: OfferDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const offer = await fetchOffer(slug);
  if (!offer) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? offer.title_ar : offer.title_en,
    description: isArabic ? offer.description_ar : offer.description_en,
  };
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tOffers, tServiceTypes, tWa, offer] = await Promise.all([
    getTranslations("OfferDetailPage"),
    getTranslations("Offers"),
    getTranslations("ServiceTypes"),
    getTranslations("Whatsapp"),
    fetchOffer(slug),
  ]);
  if (!offer) notFound();

  // Other live offers, once the reader has decided about this one. Fetched
  // after the offer itself so a missing slug 404s without a wasted round trip.
  const related = (await safeResults(getOffers({ page_size: 7 })))
    .filter((row) => row.slug !== offer.slug)
    .slice(0, 6);

  const isArabic = locale === "ar";
  const title = isArabic ? offer.title_ar : offer.title_en;
  const description = isArabic ? offer.description_ar : offer.description_en;
  const pricing = getOfferPricing(offer, locale);
  const daysLeft = daysUntilIso(offer.ends_at);
  const isEndingSoon =
    offer.status === "ACTIVE" && daysLeft !== null && daysLeft >= 0 && daysLeft <= URGENT_WITHIN_DAYS;

  return (
    <>
      {/* The same banner every other detail page opens with. This one used to
          be a narrow column with the picture boxed inside it, which read as a
          different site to the packages and hotels it sits beside. */}
      <section className="relative min-h-96 overflow-hidden bg-navy-900">
        <MediaImage
          src={offer.image}
          alt={title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/50 to-navy-950/20"
        />
        <Container className="relative flex min-h-96 flex-col justify-end py-12">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
              {tServiceTypes(offer.service_type)}
            </p>
            {pricing.discountPercentage !== null ? (
              <Badge tone="gold">
                {tOffers("discount", { percent: pricing.discountPercentage })}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-navy-100">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gold-400" />
              {tOffers("validPeriod", {
                start: formatDate(offer.starts_at, locale),
                end: formatDate(offer.ends_at, locale),
              })}
            </span>
            <span className="flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-gold-400" />
              {tOffers(`statuses.${offer.status}`)}
            </span>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <Link
                href="/offers"
                className="text-sm font-medium text-gold-700 transition-colors hover:text-gold-800"
              >
                {t("backToOffers")}
              </Link>

              {description ? (
                <p className="mt-6 whitespace-pre-line text-base leading-8 text-sand-700">
                  {description}
                </p>
              ) : null}

              {/* What an offer is, spelled out: the dates it runs between and
                  the service it applies to. The card only had room for the
                  headline figure. */}
              <h2 className="mt-10 text-xl font-bold text-navy-900">{t("detailsTitle")}</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div className="border-t border-sand-200 pt-4">
                  <dt className="text-sm text-sand-500">{t("appliesTo")}</dt>
                  <dd className="mt-1 font-semibold text-navy-900">
                    {tServiceTypes(offer.service_type)}
                  </dd>
                </div>
                <div className="border-t border-sand-200 pt-4">
                  <dt className="text-sm text-sand-500">{t("validity")}</dt>
                  <dd className="mt-1 font-semibold text-navy-900">
                    {tOffers("validPeriod", {
                      start: formatDate(offer.starts_at, locale),
                      end: formatDate(offer.ends_at, locale),
                    })}
                  </dd>
                </div>
                {pricing.savings ? (
                  <div className="border-t border-sand-200 pt-4">
                    <dt className="text-sm text-sand-500">{t("savingsLabel")}</dt>
                    <dd className="mt-1 font-semibold text-gold-700">{pricing.savings}</dd>
                  </div>
                ) : null}
                {isEndingSoon ? (
                  <div className="border-t border-sand-200 pt-4">
                    <dt className="flex items-center gap-1.5 text-sm text-sand-500">
                      <ClockIcon className="h-4 w-4" />
                      {t("endsInLabel")}
                    </dt>
                    <dd className="mt-1 font-semibold text-navy-900">
                      {t("endsIn", { days: daysLeft })}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-8 rounded-2xl border border-sand-200 bg-sand-50 p-5 text-sm leading-7 text-sand-600">
                {t("priceNote")}
              </p>
            </div>

            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              {pricing.current ? (
                <>
                  <p className="text-sm text-sand-500">{t("offerPrice")}</p>
                  <p className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-bold text-navy-900">{pricing.current}</span>
                    {pricing.strikethrough ? (
                      <>
                        <span className="sr-only">
                          {tOffers("was", { price: pricing.strikethrough })}
                        </span>
                        <span aria-hidden="true" className="text-lg text-sand-400 line-through">
                          {pricing.strikethrough}
                        </span>
                      </>
                    ) : null}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-navy-900">{t("priceOnRequest")}</p>
              )}

              {isEndingSoon ? (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm font-semibold text-navy-900">
                  <ClockIcon className="h-4 w-4 text-gold-700" />
                  {t("endsIn", { days: daysLeft })}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/contact" className={cn(buttonVariants("primary", "md"), "w-full")}>
                  {t("claim")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { offer: title }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants("outline", "md"), "w-full")}
                >
                  <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                  {tWa("short")}
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section className="bg-sand-50">
          <Container>
            <SectionHeading eyebrow={tOffers("eyebrow")} title={t("moreOffers")} />
            <ScrollGrid
              label={t("moreOffers")}
              gridClassName="sm:grid-cols-2 lg:grid-cols-3"
              className="mt-6 sm:mt-10"
            >
              {related.map((row) => (
                <OfferCard key={row.id} offer={row} />
              ))}
            </ScrollGrid>
          </Container>
        </Section>
      ) : null}

      {/* The same thumb-reach bar the packages and hotels carry, so the price
          and the way to act on it survive a long scroll on a phone. */}
      <div
        data-sticky-cta
        className="sticky bottom-0 z-30 border-t border-sand-200 bg-white py-2.5 shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.25)] lg:hidden"
      >
        <Container className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-sand-500">{tOffers(`statuses.${offer.status}`)}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {pricing.current ?? t("priceOnRequest")}
            </p>
          </div>
          <Link href="/contact" className={buttonVariants("primary", "md")}>
            {t("claim")}
          </Link>
        </Container>
      </div>
    </>
  );
}
