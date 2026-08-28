import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MediaImage } from "@/components/ui/MediaImage";
import { StarRating } from "@/components/ui/StarRating";
import { AmenityList } from "@/components/hotels/AmenityList";
import { buttonVariants } from "@/components/ui/Button";
import { PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getHotelBySlug } from "@/lib/api/hotels";
import { formatPrice, formatTime } from "@/lib/utils/format-date";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { ServiceAssurance } from "@/components/services/ServiceAssurance";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface HotelDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function fetchHotel(slug: string) {
  return fetchDetail(getHotelBySlug(slug));
}

export async function generateMetadata({ params }: HotelDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const hotel = await fetchHotel(slug);
  if (!hotel) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? hotel.name_ar : hotel.name_en,
    description: isArabic ? hotel.description_ar : hotel.description_en,
  };
}

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tHotels, tWa, tCommon, hotel] = await Promise.all([
    getTranslations("HotelDetailPage"),
    getTranslations("Hotels"),
    getTranslations("Whatsapp"),
    getTranslations("Common2"),
    fetchHotel(slug),
  ]);
  if (!hotel) notFound();

  const isArabic = locale === "ar";
  const name = isArabic ? hotel.name_ar : hotel.name_en;
  const address = isArabic ? hotel.address_ar : hotel.address_en;
  const description = isArabic ? hotel.description_ar : hotel.description_en;
  const destination = isArabic ? hotel.destination.name_ar : hotel.destination.name_en;
  const country = isArabic ? hotel.destination.country_ar : hotel.destination.country_en;

  const facts: Array<{ label: string; value: string }> = [];
  if (hotel.check_in_time) {
    facts.push({ label: tHotels("checkIn"), value: formatTime(hotel.check_in_time) });
  }
  if (hotel.check_out_time) {
    facts.push({ label: tHotels("checkOut"), value: formatTime(hotel.check_out_time) });
  }
  if (address) facts.push({ label: tHotels("address"), value: address });

  // The stay request form reads the same keys the hero widget writes, so the
  // city arrives already filled in.
  const requestHref = `/hotels?destination=${encodeURIComponent(hotel.destination.slug)}`;

  return (
    <>
      <section className="relative min-h-96 overflow-hidden bg-navy-900">
        <MediaImage
          src={hotel.cover_image}
          alt={name}
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
          <StarRating
            value={hotel.star_rating}
            label={tHotels("starRating", { count: hotel.star_rating })}
          />
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{name}</h1>
          <p className="mt-4 flex items-center gap-2 text-navy-100">
            <PinIcon className="h-4 w-4 text-gold-400" />
            {destination}
            {isArabic ? "، " : ", "}
            {country}
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <Link
                href="/hotels"
                className="text-sm font-medium text-gold-700 transition-colors hover:text-gold-800"
              >
                {t("backToHotels")}
              </Link>

              {description ? (
                <>
                  <h2 className="mt-6 text-xl font-bold text-navy-900">{tHotels("about")}</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-8 text-sand-700">
                    {description}
                  </p>
                </>
              ) : null}

              {facts.length > 0 ? (
                <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="border-t border-sand-200 pt-3">
                      <dt className="text-sm text-sand-500">{fact.label}</dt>
                      <dd className="mt-0.5 text-lg font-semibold text-navy-900">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {hotel.amenities.length > 0 ? (
                <>
                  <h2 className="mt-12 text-xl font-bold text-navy-900">{tHotels("amenities")}</h2>
                  <AmenityList amenities={hotel.amenities} />
                </>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <p className="text-sm text-sand-500">{tCommon("startingFrom")}</p>
              <p className="text-3xl font-bold text-navy-900">
                {formatPrice(hotel.price_per_night_from, locale, hotel.currency)}
                <span className="ms-1.5 text-base font-normal text-sand-500">
                  {tHotels("perNight")}
                </span>
              </p>
              <p className="mt-1 text-xs leading-6 text-sand-500">{t("priceNote")}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link href={requestHref} className={cn(buttonVariants("primary", "md"), "w-full")}>
                  {tHotels("requestBooking")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { hotel: name }))}
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

      <ServiceAssurance />

      <div
        data-sticky-cta
        className="sticky bottom-0 z-30 border-t border-sand-200 bg-white py-2.5 shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.25)] lg:hidden"
      >
        <Container className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-sand-500">{tCommon("startingFrom")}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {formatPrice(hotel.price_per_night_from, locale, hotel.currency)}
            </p>
          </div>
          <Link href={requestHref} className={buttonVariants("primary", "md")}>
            {tHotels("requestBooking")}
          </Link>
        </Container>
      </div>
    </>
  );
}
