"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { BookingWidget, type BookingOption } from "@/components/booking/BookingWidget";
import { SearchResults } from "./SearchResults";
import { useSearchTab } from "./search-tab-context";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { SEE_ALL } from "@/lib/constants/search-cross-sell";
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

  return (
    <>
      {/* The search band. Directly under the header, on a short navy field
          rather than inside a full-height hero: the client asked for it near
          the top, and a tall picture above it is what pushed it down.
          HeroBackground falls back to the same brand gradient this section
          always had, so an editor who never touches it changes nothing — and
          its own overlay_opacity scrim is what keeps the title readable over
          a photo, same as every other page's hero. */}
      <section className="relative overflow-hidden bg-navy-900">
        <HeroBackground hero={hero} priority />

        <Container className="relative py-7 sm:py-9">
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
        <Container>
          <SearchResults
            tab={tab}
            results={results}
            heading={t(`results.${tab}`)}
            description={t(`resultsHint.${tab}`)}
            href={SEE_ALL[tab]}
          />
        </Container>
      </section>
    </>
  );
}
