"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SearchTab } from "@/types/search";

interface SearchTabValue {
  tab: SearchTab;
  setTab: (tab: SearchTab) => void;
}

/*
 * Which search tab is open, shared outside the search band.
 *
 * The recommendations rail used to live inside the same client component as
 * the tab state, so "whichever tab is open" was just a prop. Once the panel
 * can put that rail anywhere on the page — see HomeSection.RECOMMENDATIONS —
 * it is no longer a sibling of the tab state, and needs to read it from
 * somewhere both components can reach. This is that somewhere.
 *
 * A default value rather than `null`, so a component that renders before the
 * provider mounts (or in a test with no provider) gets "flights" and a no-op
 * setter instead of a crash.
 */
const SearchTabContext = createContext<SearchTabValue>({
  tab: "packages",
  setTab: () => {},
});

export function SearchTabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<SearchTab>("packages");
  const value = useMemo(() => ({ tab, setTab }), [tab]);

  return <SearchTabContext.Provider value={value}>{children}</SearchTabContext.Provider>;
}

export function useSearchTab() {
  return useContext(SearchTabContext);
}
