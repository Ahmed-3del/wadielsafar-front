"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { BookingWidget, type BookingOption } from "@/components/booking/BookingWidget";
import { SearchResults } from "./SearchResults";
import type { Airport } from "@/types/airport";
import type { CruisePort } from "@/types/cruise";
import type { SearchTab, SearchResultSets } from "@/types/search";

interface HomeSearchProps {
  destinations: BookingOption[];
  visaCountries: BookingOption[];
  popularAirports: Airport[];
  cruisePorts: CruisePort[];
  defaultOrigin: string;
  results: SearchResultSets;
}

/*
 * What the tab shows next to it, once the reader has picked one.
 *
 * Never the tab's own type: someone looking at flights has already been shown
 * the flights, and a second rail of them is the page repeating itself. The
 * pairs below are what the client's feedback asked for — a flight search
 * should still put packages and hotels in front of the reader.
 */
const CROSS_SELL: Record<SearchTab, SearchTab> = {
  flights: "packages",
  hotels: "packages",
  packages: "flights",
  visas: "packages",
  cruises: "packages",
};

const SEE_ALL: Record<SearchTab, string> = {
  flights: "/flights",
  hotels: "/hotels",
  packages: "/packages",
  visas: "/visas",
  cruises: "/cruises",
};

/*
 * The search, and everything that answers it.
 *
 * The tab lives here rather than inside the widget because two things below
 * depend on it: the results, and the cross-sell that must not duplicate them.
 * Lifting it is what lets the page respond to a tab without a navigation.
 */
export function HomeSearch({
  destinations,
  visaCountries,
  popularAirports,
  cruisePorts,
  defaultOrigin,
  results,
}: HomeSearchProps) {
  const t = useTranslations("Search");
  const tBooking = useTranslations("Booking");
  const [tab, setTab] = useState<SearchTab>("flights");

  const crossTab = CROSS_SELL[tab];

  return (
    <>
      {/* The search band. Directly under the header, on a short navy field
          rather than inside a full-height hero: the client asked for it near
          the top, and a tall picture above it is what pushed it down. */}
      <section className="bg-linear-to-br from-navy-900 via-navy-800 to-navy-900">
        <Container className="py-7 sm:py-9">
          <div className="mb-5 text-center lg:text-start">
            <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              {t("title")}
            </h1>
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
          />
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container className="flex flex-col gap-10">
          <SearchResults
            tab={tab}
            results={results}
            heading={t(`results.${tab}`)}
            description={t(`resultsHint.${tab}`)}
            href={SEE_ALL[tab]}
          />

          {/* Always present, whichever tab is open — the point is that someone
              who came for one service leaves knowing about another. */}
          <div className="border-t border-sand-200 pt-10">
            <SearchResults
              tab={crossTab}
              results={results}
              heading={t("crossSellTitle")}
              description={t("crossSellHint", { service: tBooking(`tabs.${crossTab}`) })}
              href={SEE_ALL[crossTab]}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
