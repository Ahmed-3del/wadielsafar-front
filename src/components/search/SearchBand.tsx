import { getLocale, getTranslations } from "next-intl/server";
import { HomeSearch } from "./HomeSearch";
import type { BookingOption } from "@/components/booking/BookingWidget";
import { getDestinations } from "@/lib/api/destinations";
import { getVisaCountries } from "@/lib/api/visas";
import { getPopularAirports } from "@/lib/api/airports";
import { getCruisePorts } from "@/lib/api/cruises";
import { getSearchResults } from "@/lib/api/home-search";
import { safeResults } from "@/lib/api/client";

/*
 * Server half of the homepage search: it loads the option lists and all five
 * result sets, then hands them to the client component that owns the tab.
 *
 * This replaced the full-height hero. The hero's photograph was the first
 * thing on the page and the search the second, which is the wrong way round
 * for a site people arrive at with a trip in mind.
 */
export async function SearchBand() {
  const [locale, tBooking, destinations, visaCountries, popularAirports, cruisePorts, results] =
    await Promise.all([
      getLocale(),
      getTranslations("Booking"),
      safeResults(getDestinations({ page_size: 50 })),
      safeResults(getVisaCountries({ page_size: 50 })),
      safeResults(getPopularAirports()),
      safeResults(getCruisePorts()),
      getSearchResults(),
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

  const riyadh = popularAirports.find((a) => a.iata_code === "RUH");
  const defaultOrigin = riyadh
    ? `${isArabic ? riyadh.city_ar : riyadh.city_en} (${riyadh.iata_code})`
    : tBooking("defaultOrigin");

  return (
    <HomeSearch
      destinations={destinationOptions}
      visaCountries={visaOptions}
      popularAirports={popularAirports}
      cruisePorts={cruisePorts}
      defaultOrigin={defaultOrigin}
      results={results}
    />
  );
}
