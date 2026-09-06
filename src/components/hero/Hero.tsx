import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { BookingWidget, type BookingOption } from "@/components/booking/BookingWidget";
import { HeroBackground } from "./HeroBackground";
import { getDestinations } from "@/lib/api/destinations";
import { getVisaCountries } from "@/lib/api/visas";
import { getPopularAirports } from "@/lib/api/airports";
import { getCruisePorts } from "@/lib/api/cruises";
import { getPageHero } from "@/lib/api/page-heroes";
import { safeResults } from "@/lib/api/client";
import { heroCopy } from "@/lib/utils/hero-copy";

/*
 * Server Component: it loads the widget's option lists and the editable hero
 * so the search opens populated and the background paints on first render
 * rather than after hydration.
 */
export async function Hero() {
  const [t, tBooking, locale, destinations, visaCountries, popularAirports, cruisePorts, hero] =
    await Promise.all([
      getTranslations("Hero"),
      getTranslations("Booking"),
      getLocale(),
      safeResults(getDestinations({ page_size: 50 })),
      safeResults(getVisaCountries({ page_size: 50 })),
      safeResults(getPopularAirports()),
      safeResults(getCruisePorts()),
      getPageHero("home").catch(() => null),
    ]);

  const isArabic = locale === "ar";
  const destinationOptions: BookingOption[] = destinations.map((d) => ({
    value: d.slug,
    label: isArabic ? d.name_ar : d.name_en,
    description: isArabic ? d.country_ar : d.country_en,
  }));
  const visaOptions: BookingOption[] = visaCountries.map((c) => ({
    value: String(c.id),
    label: isArabic ? c.name_ar : c.name_en,
  }));

  /* The departure field starts on Riyadh, but on the catalogue's Riyadh rather
     than a translated string — so the value that reaches an agent carries the
     airport code like every other answer. Falls back to the plain city name if
     the catalogue is unreachable. */
  const riyadh = popularAirports.find((a) => a.iata_code === "RUH");
  const defaultOrigin = riyadh
    ? `${isArabic ? riyadh.city_ar : riyadh.city_en} (${riyadh.iata_code})`
    : tBooking("defaultOrigin");

  const copy = heroCopy(hero, isArabic, {
    eyebrow: t("eyebrow"),
    title: t("title"),
    subtitle: t("subtitle"),
  });

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <HeroBackground hero={hero} priority />

      <Container className="relative pb-10 pt-14 sm:pt-20 lg:pb-16 lg:pt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-navy-100 sm:text-lg">{copy.subtitle}</p>
        </div>

        <div className="mt-9 lg:mt-12">
          <BookingWidget
            destinations={destinationOptions}
            visaCountries={visaOptions}
            popularAirports={popularAirports}
            cruisePorts={cruisePorts}
            defaultOrigin={defaultOrigin}
          />
        </div>
      </Container>
    </section>
  );
}
