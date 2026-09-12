"use client";

import { useEffect, useState } from "react";

/*
 * Fetches a fresh, filtered list the moment a widget selection changes,
 * replacing the homepage's preloaded sample for that tab — first built for
 * the visas tab, generalised here once packages, hotels and cruises needed
 * the exact same shape.
 *
 * `enabled` is what tells this apart from "nothing chosen yet": false skips
 * the fetch entirely and reports `null`, which callers treat as "show the
 * preloaded sample" rather than as an empty result.
 *
 * The fetch itself is deferred a tick via `setTimeout` rather than called
 * straight from the effect body — an effect that sets state synchronously in
 * its own body trips this project's lint rule, and a real network call could
 * never run synchronously anyway. `deps` is spread into the dependency array
 * by design: every caller passes a different shape (a country, a country and
 * a purpose, a destination and a budget), so this cannot be typed as a fixed
 * tuple the linter could check on its own — hence the disable below.
 */
export function useLiveFilter<T>(
  enabled: boolean,
  fetcher: () => Promise<T[]>,
  deps: unknown[],
): { results: T[] | null; isLoading: boolean } {
  const [results, setResults] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetcher()
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps is the caller's own array, one entry per real filter field; fetcher is rebuilt from those same values each render.
  }, [enabled, ...deps]);

  return { results, isLoading };
}
