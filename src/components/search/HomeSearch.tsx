"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { BookingWidget, type BookingOption } from "@/components/booking/BookingWidget";
import { SearchResults } from "./SearchResults";
import { useSearchTab } from "./search-tab-context";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { SEE_ALL } from "@/lib/constants/search-cross-sell";
import { searchVisasAction } from "@/lib/actions/search-visas";
import type { Airport } from "@/types/airport";
import type { CruisePort } from "@/types/cruise";
import type { SearchResultSets } from "@/types/search";
import type { PageHero } from "@/types/page-hero";
import type { VisaType } from "@/types/visa";

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

  // Chosen in the widget's visas tab. `country` empty means nothing has been
  // picked yet, and the preloaded sample below keeps showing as it always did.
  const [visaFilter, setVisaFilter] = useState({ country: "", purpose: "" });
  const [liveVisas, setLiveVisas] = useState<VisaType[] | null>(null);
  const [isFilteringVisas, setIsFilteringVisas] = useState(false);

  useEffect(() => {
    // Nothing to fetch with an empty country — the guard below on
    // `visaFilter.country` is what stops a stale answer from a previous
    // selection being shown once this one is cleared, so there is nothing
    // to reset here.
    if (!visaFilter.country) return;
    let cancelled = false;
    // Deferred a tick rather than called straight from the effect body — same
    // shape as Combobox's own debounce, minus the delay: a discrete pick from
    // a list is one request, not keystrokes to throttle.
    const timer = setTimeout(() => {
      setIsFilteringVisas(true);
      searchVisasAction(visaFilter.country, visaFilter.purpose)
        .then((matches) => {
          if (!cancelled) setLiveVisas(matches);
        })
        .catch(() => {
          if (!cancelled) setLiveVisas([]);
        })
        .finally(() => {
          if (!cancelled) setIsFilteringVisas(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visaFilter.country, visaFilter.purpose]);

  // Only the visas tab ever narrows like this — swapped in wholesale rather
  // than merged, since the other four keys are untouched either way. Gated on
  // `visaFilter.country` too, not just `liveVisas`, so a cleared selection
  // falls straight back to the preloaded sample rather than a stale answer to
  // a country that is no longer chosen.
  const effectiveResults: SearchResultSets =
    visaFilter.country && liveVisas !== null ? { ...results, visas: liveVisas } : results;
  const isFilteringVisibleVisas = !!visaFilter.country && isFilteringVisas;

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
            onVisaFilterChange={setVisaFilter}
          />
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container>
          <SearchResults
            tab={tab}
            results={effectiveResults}
            heading={t(`results.${tab}`)}
            description={t(`resultsHint.${tab}`)}
            href={SEE_ALL[tab]}
            isLoading={tab === "visas" && isFilteringVisibleVisas}
          />
        </Container>
      </section>
    </>
  );
}
