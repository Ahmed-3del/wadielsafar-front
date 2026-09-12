"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { BookingWidget, type BookingOption } from "@/components/booking/BookingWidget";
import { SearchResults } from "./SearchResults";
import { useSearchTab } from "./search-tab-context";
import { useLiveFilter } from "./useLiveFilter";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { SEE_ALL } from "@/lib/constants/search-cross-sell";
import { searchVisasAction } from "@/lib/actions/search-visas";
import { searchPackagesAction } from "@/lib/actions/search-packages";
import { searchHotelsAction } from "@/lib/actions/search-hotels";
import { searchCruisesAction } from "@/lib/actions/search-cruises";
import { searchFlightsAction } from "@/lib/actions/search-flights";
import type { Airport } from "@/types/airport";
import type { CruisePort } from "@/types/cruise";
import type { SearchResultSets } from "@/types/search";
import type { PageHero } from "@/types/page-hero";

interface HomeSearchProps {
  destinations: BookingOption[];
  visaCountries: BookingOption[];
  popularAirports: Airport[];
  cruisePorts: CruisePort[];
  defaultOrigin: string;
  results: SearchResultSets;
  /** Editor-configured background for the band; null falls back to the brand
   *  gradient. Only the background is used here — the band keeps its own
   *  translated heading rather than an editor-entered one. */
  hero: PageHero | null;
}

/*
 * The search band: the widget, and the results for whichever tab is open.
 *
 * The "you might also like" rail that used to sit directly beneath this is
 * now its own component — see Recommendations.tsx — positioned wherever the
 * panel puts it in the homepage's running order rather than pinned here. The
 * tab state that both need lives in SearchTabProvider, a level up in
 * page.tsx, rather than in this component's own state: a sibling section
 * cannot read a useState that belongs to this one.
 */
export function HomeSearch({
  destinations,
  visaCountries,
  popularAirports,
  cruisePorts,
  defaultOrigin,
  results,
  hero,
}: HomeSearchProps) {
  const t = useTranslations("Search");
  const { tab, setTab } = useSearchTab();

  /*
   * One filter, one live-fetch hook, per tab that has a field the catalogue
   * can actually narrow by — see useLiveFilter and each search-*Action for
   * why a fetch only ever fires once a real value is chosen, and why hotel
   * and flight dates are absent here (no matching filter exists server-side).
   * `enabled` also gates the merge below, so clearing every field on a tab
   * falls straight back to the preloaded sample rather than a stale answer.
   */
  const [visaFilter, setVisaFilter] = useState({ country: "", purpose: "" });
  const visasEnabled = !!visaFilter.country;
  const visas = useLiveFilter(
    visasEnabled,
    () => searchVisasAction(visaFilter.country, visaFilter.purpose),
    [visaFilter.country, visaFilter.purpose],
  );

  const [packagesFilter, setPackagesFilter] = useState({ destination: "", priceMax: "" });
  const packagesEnabled = !!(packagesFilter.destination || packagesFilter.priceMax);
  const packages = useLiveFilter(
    packagesEnabled,
    () => searchPackagesAction(packagesFilter.destination, packagesFilter.priceMax),
    [packagesFilter.destination, packagesFilter.priceMax],
  );

  const [hotelsFilter, setHotelsFilter] = useState({ destination: "" });
  const hotelsEnabled = !!hotelsFilter.destination;
  const hotels = useLiveFilter(hotelsEnabled, () => searchHotelsAction(hotelsFilter.destination), [
    hotelsFilter.destination,
  ]);

  const [cruisesFilter, setCruisesFilter] = useState({ country: "", port: "", departAfter: "" });
  const cruisesEnabled = !!(
    cruisesFilter.country ||
    cruisesFilter.port ||
    cruisesFilter.departAfter
  );
  const cruises = useLiveFilter(
    cruisesEnabled,
    () => searchCruisesAction(cruisesFilter.country, cruisesFilter.port, cruisesFilter.departAfter),
    [cruisesFilter.country, cruisesFilter.port, cruisesFilter.departAfter],
  );

  const [flightsFilter, setFlightsFilter] = useState({ originCode: "", destinationCode: "" });
  const flightsEnabled = !!(flightsFilter.originCode || flightsFilter.destinationCode);
  const flights = useLiveFilter(
    flightsEnabled,
    () => searchFlightsAction(flightsFilter.originCode, flightsFilter.destinationCode),
    [flightsFilter.originCode, flightsFilter.destinationCode],
  );
  // 1- الباقات 2- التاشيرات 3- الكروز 4- الفنادق 5- الطيران
  // A switch rather than a lookup keyed by `tab`: each tab's live list is a
  // different element type, and only a literal case here lets that type line
  // up with the one results key it is allowed to replace.
  function liveResultsFor(): SearchResultSets {
    switch (tab) {
      case "packages":
        return packagesEnabled && packages.results !== null
          ? { ...results, packages: packages.results }
          : results;

      case "visas":
        return visasEnabled && visas.results !== null
          ? { ...results, visas: visas.results }
          : results;

      case "cruises":
        return cruisesEnabled && cruises.results !== null
          ? { ...results, cruises: cruises.results }
          : results;
      case "hotels":
        return hotelsEnabled && hotels.results !== null
          ? { ...results, hotels: hotels.results }
          : results;

      case "flights":
        return flightsEnabled && flights.results !== null
          ? { ...results, flights: flights.results }
          : results;
    }
  }

  function isLoadingNow(): boolean {
    switch (tab) {
      case "packages":
        return packagesEnabled && packages.isLoading;
      case "visas":
        return visasEnabled && visas.isLoading;
      case "cruises":
        return cruisesEnabled && cruises.isLoading;
      case "hotels":
        return hotelsEnabled && hotels.isLoading;

      case "flights":
        return flightsEnabled && flights.isLoading;
    }
  }

  return (
    <>
      {/* The search band. Directly under the header, on a short navy field
          rather than inside a full-height hero: the client asked for it near
          the top, and a tall picture above it is what pushed it down.
          HeroBackground falls back to the same brand gradient this section
          always had, so an editor who never touches it changes nothing — and
          its own overlay_opacity scrim is what keeps the title readable over
          a photo, same as every other page's hero. */}
      <section className="bg-navy-900 relative overflow-hidden">
        <HeroBackground hero={hero} priority />

        <Container className="relative py-7 sm:py-9">
          <div className="mb-5 text-center lg:text-start">
            <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">{t("title")}</h1>
            <p className="mt-1.5 text-sm text-white/70">{t("subtitle")}</p>
          </div>

          <BookingWidget
            destinations={destinations}
            visaCountries={visaCountries}
            popularAirports={popularAirports}
            cruisePorts={cruisePorts}
            defaultOrigin={defaultOrigin}
            tab={tab}
            onTabChange={setTab}
            onVisaFilterChange={setVisaFilter}
            onPackagesFilterChange={setPackagesFilter}
            onHotelsFilterChange={setHotelsFilter}
            onCruisesFilterChange={setCruisesFilter}
            onFlightsFilterChange={setFlightsFilter}
          />
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container>
          <SearchResults
            tab={tab}
            results={liveResultsFor()}
            heading={t(`results.${tab}`)}
            description={t(`resultsHint.${tab}`)}
            href={SEE_ALL[tab]}
            isLoading={isLoadingNow()}
          />
        </Container>
      </section>
    </>
  );
}
