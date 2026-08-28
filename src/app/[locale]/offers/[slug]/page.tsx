import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { getOfferBySlug } from "@/lib/api/offers";
import { formatDate } from "@/lib/utils/format-date";
import { getOfferPricing } from "@/lib/utils/pricing";
import { cn } from "@/lib/utils/cn";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface OfferDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

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

  const [t, tOffers, tServiceTypes, tCta, offer] = await Promise.all([
    getTranslations("OfferDetailPage"),
    getTranslations("Offers"),
    getTranslations("ServiceTypes"),
    getTranslations("FinalCta"),
    fetchOffer(slug),
  ]);
  if (!offer) notFound();

  const isArabic = locale === "ar";
  const title = isArabic ? offer.title_ar : offer.title_en;
  const description = isArabic ? offer.description_ar : offer.description_en;
  const image = offer.image;
  const pricing = getOfferPricing(offer, locale);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/offers" className="text-sm font-medium text-gold-700 hover:text-gold-800">
          {t("backToOffers")}
        </Link>

        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl">
          <MediaImage
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
          {pricing.discountPercentage !== null ? (
            <span className="absolute start-4 top-4 rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-navy-900">
              {tOffers("discount", { percent: pricing.discountPercentage })}
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-700">
            {tServiceTypes(offer.service_type)}
          </span>
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">
            {tOffers(`statuses.${offer.status}`)}
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-bold text-navy-900">{title}</h1>

        {pricing.current ? (
          <p className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-gold-700">{pricing.current}</span>
            {pricing.strikethrough ? (
              <>
                <span className="sr-only">{tOffers("was", { price: pricing.strikethrough })}</span>
                <span aria-hidden="true" className="text-lg text-sand-400 line-through">
                  {pricing.strikethrough}
                </span>
              </>
            ) : null}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-sand-500">
          {tOffers("validPeriod", {
            start: formatDate(offer.starts_at, locale),
            end: formatDate(offer.ends_at, locale),
          })}
        </p>

        {description ? (
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-sand-700">
            {description}
          </p>
        ) : null}

        <Link href="/contact" className={cn(buttonVariants("primary", "lg"), "mt-8")}>
          {tCta("cta")}
        </Link>
      </Container>
    </Section>
  );
}
