import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MediaImage } from "@/components/ui/MediaImage";
import { Itinerary } from "@/components/ui/Itinerary";
import { InclusionList } from "@/components/ui/InclusionList";
import { buttonVariants } from "@/components/ui/Button";
import { CalendarIcon, ClockIcon, PinIcon, ShipIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getCruiseBySlug } from "@/lib/api/cruises";
import { fetchDetail } from "@/lib/api/fetch-detail";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";

interface CruiseDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateMetadata({ params }: CruiseDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const cruise = await fetchDetail(getCruiseBySlug(slug));
  if (!cruise) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? cruise.title_ar : cruise.title_en,
    description: isArabic ? cruise.description_ar : cruise.description_en,
  };
}

export default async function CruiseDetailPage({ params }: CruiseDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tWa, cruise] = await Promise.all([
    getTranslations("Cruises"),
    getTranslations("Whatsapp"),
    fetchDetail(getCruiseBySlug(slug)),
  ]);
  if (!cruise) notFound();

  const isArabic = locale === "ar";
  const title = isArabic ? cruise.title_ar : cruise.title_en;
  const line = isArabic ? cruise.cruise_line_ar : cruise.cruise_line_en;
  const port = isArabic ? cruise.departure_port_ar : cruise.departure_port_en;
  const description = isArabic ? cruise.description_ar : cruise.description_en;
  const included = isArabic ? cruise.included_services_ar : cruise.included_services_en;
  const days = cruise.duration_nights + 1;

  return (
    <>
      <section className="relative min-h-96 overflow-hidden bg-navy-900">
        <MediaImage
          src={cruise.cover_image}
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
          {line ? (
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
              <ShipIcon className="h-4 w-4" />
              {line}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-navy-100">
            <span className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gold-400" />
              {t("durationNights", { days, nights: cruise.duration_nights })}
            </span>
            {cruise.departure_date ? (
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gold-400" />
                {t("departsOn", { date: formatDate(cruise.departure_date, locale) })}
              </span>
            ) : null}
            {port ? (
              <span className="flex items-center gap-2">
                <PinIcon className="h-4 w-4 text-gold-400" />
                {t("departsFrom", { port })}
              </span>
            ) : null}
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              {description ? (
                <p className="whitespace-pre-line text-base leading-8 text-sand-700">
                  {description}
                </p>
              ) : null}

              {included ? (
                <>
                  <h2 className="mt-10 text-xl font-bold text-navy-900">{t("includedTitle")}</h2>
                  <InclusionList text={included} className="mt-5" />
                </>
              ) : null}

              {cruise.itinerary.length > 0 ? (
                <>
                  <h2 className="mt-12 text-xl font-bold text-navy-900">{t("itineraryTitle")}</h2>
                  <Itinerary
                    className="mt-6"
                    items={cruise.itinerary.map((stop) => ({
                      id: stop.id,
                      day: stop.day_number,
                      title: isArabic ? stop.port_ar : stop.port_en,
                      description: isArabic ? stop.description_ar : stop.description_en,
                    }))}
                    dayLabel={(day) => t("dayLabel", { day })}
                  />
                </>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <p className="text-sm text-sand-500">{t("startingFrom")}</p>
              <p className="text-3xl font-bold text-navy-900">
                {formatPrice(cruise.price_from, locale)}
              </p>
              <p className="mt-1 text-xs text-sand-500">{t("priceNote")}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/contact" className={cn(buttonVariants("primary", "md"), "w-full")}>
                  {t("bookNow")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { cruise: title }))}
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

      {/* Mobile keeps the primary action reachable without scrolling back up. */}
      <div
        data-sticky-cta
        className="sticky bottom-0 z-30 border-t border-sand-200 bg-white py-2.5 shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.25)] lg:hidden"
      >
        <Container className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-sand-500">{t("startingFrom")}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {formatPrice(cruise.price_from, locale)}
            </p>
          </div>
          <Link href="/contact" className={buttonVariants("primary", "md")}>
            {t("bookNow")}
          </Link>
        </Container>
      </div>
    </>
  );
}
