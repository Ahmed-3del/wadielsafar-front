"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { FlightCard } from "@/components/flights/FlightCard";
import { HotelCard } from "@/components/hotels/HotelCard";
import { PackageCard } from "@/components/packages/PackageCard";
import { VisaCard } from "@/components/visas/VisaCard";
import { CruiseCard } from "@/components/cruises/CruiseCard";
import { ChevronForwardIcon } from "@/components/ui/icons";
import type { SearchTab, SearchResultSets } from "@/types/search";

interface SearchResultsProps {
  tab: SearchTab;
  results: SearchResultSets;
  /** Used by the cross-sell block, which shows the same lists under a
   *  different heading and must not repeat what is already above it. */
  heading: string;
  description?: string;
  /** Where "see all" goes. */
  href: string;
}

/*
 * The cards under the search, for whichever tab is open.
 *
 * All five lists are rendered from data the page already fetched on the
 * server, and switching tabs picks one — no request, no spinner. The lists are
 * short (six each) so carrying all five costs less than a round trip would.
 */
export function SearchResults({ tab, results, heading, description, href }: SearchResultsProps) {
  const t = useTranslations("Search");

  const content = {
    flights: results.flights.map((flight) => <FlightCard key={flight.id} flight={flight} />),
    hotels: results.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />),
    packages: results.packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />),
    visas: results.visas.map((visa) => <VisaCard key={visa.id} visa={visa} />),
    cruises: results.cruises.map((cruise) => <CruiseCard key={cruise.id} cruise={cruise} />),
  }[tab];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy-900 sm:text-2xl">{heading}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-sand-600">{description}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
        >
          {t("seeAll")}
          <ChevronForwardIcon className="h-4 w-4" />
        </Link>
      </div>

      {content.length > 0 ? (
        <ScrollGrid
          label={heading}
          gridClassName="sm:grid-cols-2 lg:grid-cols-3"
          className="mt-5"
        >
          {content}
        </ScrollGrid>
      ) : (
        /* Named, not blank. A visitor who filters into an empty result needs
           to be told what happened and offered the way out. */
        <p className="mt-5 rounded-2xl border border-dashed border-sand-300 bg-sand-50 px-5 py-8 text-center text-sm text-sand-600">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
