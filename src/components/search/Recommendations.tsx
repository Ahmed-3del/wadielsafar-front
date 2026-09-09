"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SearchResults } from "./SearchResults";
import { useSearchTab } from "./search-tab-context";
import { CROSS_SELL, SEE_ALL } from "@/lib/constants/search-cross-sell";
import type { SearchResultSets } from "@/types/search";

interface RecommendationsProps {
  results: SearchResultSets;
}

/*
 * "You might also like" — a short list from a different service than
 * whichever search tab is open, so someone who came for one thing leaves
 * knowing about another.
 *
 * A HomeSection like any other now (see apps.pages HomeSection.RECOMMENDATIONS
 * on the backend), positioned wherever the panel puts it. It used to be
 * hard-coded directly under the main search results with no row in that
 * table and nothing an editor could do about its place on the page.
 *
 * Still reacts live to the tab even from elsewhere on the page: it reads the
 * same context HomeSearch writes to, rather than a prop passed down through
 * page.tsx — the two are siblings in the section list, not parent and child.
 */
export function Recommendations({ results }: RecommendationsProps) {
  const t = useTranslations("Search");
  const tBooking = useTranslations("Booking");
  const { tab } = useSearchTab();
  const crossTab = CROSS_SELL[tab];

  return (
    <Section>
      <Container>
        <SearchResults
          tab={crossTab}
          results={results}
          heading={t("crossSellTitle")}
          description={t("crossSellHint", { service: tBooking(`tabs.${crossTab}`) })}
          href={SEE_ALL[crossTab]}
        />
      </Container>
    </Section>
  );
}
