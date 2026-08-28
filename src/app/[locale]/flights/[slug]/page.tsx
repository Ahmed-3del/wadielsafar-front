import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { FlightRoute } from "@/components/flights/FlightRoute";
import { WhatsAppIcon } from "@/components/ui/icons";
import { getFlightDealBySlug } from "@/lib/api/flights";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { ServiceAssurance } from "@/components/services/ServiceAssurance";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface FlightDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function fetchFlightDeal(slug: string) {
  return fetchDetail(getFlightDealBySlug(slug));
}

export async function generateMetadata({ params }: FlightDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const flight = await fetchFlightDeal(slug);
  if (!flight) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? flight.title_ar : flight.title_en,
    description: isArabic
      ? `${flight.origin_city_ar} إلى ${flight.destination_city_ar}`
      : `${flight.origin_city_en} to ${flight.destination_city_en}`,
  };
}

export default async function FlightDetailPage({ params }: FlightDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tFlights, tWa, tCommon, flight] = await Promise.all([
    getTranslations("FlightDetailPage"),
    getTranslations("Flights"),
    getTranslations("Whatsapp"),
    getTranslations("Common2"),
    fetchFlightDeal(slug),
  ]);
  if (!flight) notFound();

  const isArabic = locale === "ar";
  const title = isArabic ? flight.title_ar : flight.title_en;
  const origin = isArabic ? flight.origin_city_ar : flight.origin_city_en;
  const destination = isArabic ? flight.destination_city_ar : flight.destination_city_en;
  const airline =
    (isArabic ? flight.airline_name_ar : flight.airline_name_en) || flight.airline_name_en;

  const facts: Array<{ label: string; value: string }> = [
    { label: tFlights("trip"), value: tFlights(`tripTypes.${flight.trip_type}`) },
    { label: tFlights("cabin"), value: tFlights(`cabinClasses.${flight.cabin_class}`) },
  ];
  if (airline) facts.push({ label: tFlights("airline"), value: airline });
  if (flight.departure_date) {
    facts.push({ label: tFlights("departure"), value: formatDate(flight.departure_date, locale) });
  }
  if (flight.return_date) {
    facts.push({ label: tFlights("returnDate"), value: formatDate(flight.return_date, locale) });
  }
  if (flight.baggage_allowance_kg !== null) {
    facts.push({
      label: tFlights("baggageLabel"),
      value: tFlights("kilograms", { kg: flight.baggage_allowance_kg }),
    });
  }

  /*
   * The request form on /flights understands the same query keys the hero
   * widget uses, so a traveller arriving from this deal starts with the route
   * and dates already filled in rather than retyping what they just read.
   */
  const requestParams = new URLSearchParams({ from: origin, search: destination });
  if (flight.departure_date) requestParams.set("depart", flight.departure_date);
  if (flight.return_date) requestParams.set("return", flight.return_date);
  const requestHref = `/flights?${requestParams.toString()}`;

  const routeLabel = `${origin} → ${destination}`;

  return (
    <>
      {/* Flight deals carry no photography, only an airline logo — so the
          banner is built from the route itself, which is the thing being sold. */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-navy-950 via-navy-900 to-navy-700"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_75%_15%,var(--color-gold-500),transparent_55%)]"
        />
        <Container className="relative py-14 sm:py-20">
          {airline ? (
            <div className="flex items-center gap-2.5">
              {flight.airline_logo ? (
                <Image
                  src={flight.airline_logo}
                  alt=""
                  aria-hidden="true"
                  width={32}
                  height={32}
                  className="rounded bg-white/90 object-contain p-0.5"
                />
              ) : null}
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
                {airline}
              </span>
            </div>
          ) : null}
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <FlightRoute
            origin={origin}
            originCode={flight.origin_airport_code}
            destination={destination}
            destinationCode={flight.destination_airport_code}
            className="mt-6 text-xl text-white"
          />
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <Link
                href="/flights"
                className="text-sm font-medium text-gold-700 transition-colors hover:text-gold-800"
              >
                {t("backToFlights")}
              </Link>

              <h2 className="mt-6 text-xl font-bold text-navy-900">{t("aboutTitle")}</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="border-t border-sand-200 pt-3">
                    <dt className="text-sm text-sand-500">{fact.label}</dt>
                    <dd className="mt-0.5 text-lg font-semibold text-navy-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <p className="text-sm text-sand-500">{tCommon("startingFrom")}</p>
              <p className="text-3xl font-bold text-navy-900">
                {formatPrice(flight.price_from, locale, flight.currency)}
              </p>
              <p className="mt-1 text-xs leading-6 text-sand-500">{t("priceNote")}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link href={requestHref} className={cn(buttonVariants("primary", "md"), "w-full")}>
                  {tFlights("requestBooking")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { route: routeLabel }))}
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
            <p className="text-xs text-sand-500">{routeLabel}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {formatPrice(flight.price_from, locale, flight.currency)}
            </p>
          </div>
          <Link href={requestHref} className={buttonVariants("primary", "md")}>
            {tFlights("requestBooking")}
          </Link>
        </Container>
      </div>
    </>
  );
}
