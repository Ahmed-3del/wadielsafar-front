import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MediaImage } from "@/components/ui/MediaImage";
import { Badge } from "@/components/ui/Badge";
import { Itinerary } from "@/components/ui/Itinerary";
import { InclusionList } from "@/components/ui/InclusionList";
import { buttonVariants } from "@/components/ui/Button";
import { contactHref } from "@/lib/utils/contact-link";
import { ClockIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getPackageBySlug } from "@/lib/api/packages";
import { fetchDetail } from "@/lib/api/fetch-detail";
import { formatPrice } from "@/lib/utils/format-date";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";

interface PackageDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function fetchPackage(slug: string) {
  return fetchDetail(getPackageBySlug(slug));
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const pkg = await fetchPackage(slug);
  if (!pkg) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? pkg.title_ar : pkg.title_en,
    description: isArabic ? pkg.description_ar : pkg.description_en,
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tPackages, tWa, pkg] = await Promise.all([
    getTranslations("PackageDetailPage"),
    getTranslations("Packages"),
    getTranslations("Whatsapp"),
    fetchPackage(slug),
  ]);
  if (!pkg) notFound();

  const isArabic = locale === "ar";
  const title = isArabic ? pkg.title_ar : pkg.title_en;
  const description = isArabic ? pkg.description_ar : pkg.description_en;
  const included = isArabic ? pkg.included_services_ar : pkg.included_services_en;
  const destination = isArabic ? pkg.destination.name_ar : pkg.destination.name_en;
  const category = isArabic ? pkg.category.name_ar : pkg.category.name_en;
  const nights = Math.max(pkg.duration_days - 1, 0);

  return (
    <>
      <section className="relative min-h-96 overflow-hidden bg-navy-900">
        <MediaImage
          src={pkg.cover_image}
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
              {destination}
            </p>
            {/* is_featured is an editor decision that was visible on the card
                and then vanished on the page the card leads to. */}
            {pkg.is_featured ? <Badge tone="gold">{tPackages("badgeFeatured")}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-navy-100">
            <span className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gold-400" />
              {tPackages("durationNights", { days: pkg.duration_days, nights })}
            </span>
            <span className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 text-gold-400" />
              {category}
            </span>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <Link
                href="/packages"
                className="text-sm font-medium text-gold-700 transition-colors hover:text-gold-800"
              >
                {t("backToPackages")}
              </Link>

              {description ? (
                <p className="mt-6 whitespace-pre-line text-base leading-8 text-sand-700">
                  {description}
                </p>
              ) : null}

              {included ? (
                <>
                  <h2 className="mt-10 text-xl font-bold text-navy-900">
                    {tPackages("includedTitle")}
                  </h2>
                  <InclusionList text={included} className="mt-5" />
                </>
              ) : null}

              {pkg.itinerary.length > 0 ? (
                <>
                  <h2 className="mt-12 text-xl font-bold text-navy-900">
                    {tPackages("itineraryTitle")}
                  </h2>
                  <Itinerary
                    className="mt-6"
                    items={pkg.itinerary.map((day) => ({
                      id: day.id,
                      day: day.day_number,
                      title: isArabic ? day.title_ar : day.title_en,
                      description: isArabic ? day.description_ar : day.description_en,
                    }))}
                    dayLabel={(day) => tPackages("dayLabel", { day })}
                  />
                </>
              ) : null}

              {/* Someone who reads a whole itinerary and still does not book
                  usually wants it changed, not abandoned — so the exit here is
                  the planner rather than a dead end. */}
              <div className="mt-12 rounded-2xl border border-sand-200 bg-sand-50 p-6">
                <h2 className="text-lg font-bold text-navy-900">{tPackages("planPrompt")}</h2>
                <p className="mt-2 text-sm leading-7 text-sand-600">{tPackages("planPromptBody")}</p>
                <Link href="/packages/plan" className={cn(buttonVariants("outline", "md"), "mt-4")}>
                  {tPackages("planCta")}
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <p className="text-sm text-sand-500">{tPackages("startingFrom")}</p>
              <p className="text-3xl font-bold text-navy-900">
                {formatPrice(pkg.price_from, locale)}
              </p>
              <p className="mt-1 text-xs text-sand-500">{t("priceNote")}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={contactHref({ service: "PACKAGE", topic: title })}
                  className={cn(buttonVariants("primary", "md"), "w-full")}
                >
                  {t("bookNow")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { package: title }))}
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

      <div
        data-sticky-cta
        className="sticky bottom-0 z-30 border-t border-sand-200 bg-white py-2.5 shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.25)] lg:hidden"
      >
        <Container className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-sand-500">{tPackages("startingFrom")}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {formatPrice(pkg.price_from, locale)}
            </p>
          </div>
          <Link
            href={contactHref({ service: "PACKAGE", topic: title })}
            className={buttonVariants("primary", "md")}
          >
            {t("bookNow")}
          </Link>
        </Container>
      </div>
    </>
  );
}
