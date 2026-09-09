import { getHomeSections } from "@/lib/api/home-sections";
import { HOME_SECTION_KEYS, type HomeSectionKey } from "@/types/home-section";

/*
 * What the homepage shows, and in what order.
 *
 * The shipped order is the floor. An unreachable API must not leave the
 * homepage as a hero and nothing else, and neither must a table someone has
 * switched every row off in by accident — an empty answer is treated as a
 * failure for the same reason the footer treats an empty branch list as one.
 */
const SHIPPED_ORDER: HomeSectionKey[] = [
  "RECOMMENDATIONS",
  "SERVICES",
  // EXPLORER switched off here too — see the pages.0008 migration on the
  // backend. Kept out of the fallback rather than the key list itself, so
  // switching it back on in the panel needs no deploy.
  "DESTINATIONS",
  "OFFERS",
  "VISAS",
  "TRUST",
  "TESTIMONIALS",
  "CTA",
];

export async function resolveHomeSections(): Promise<HomeSectionKey[]> {
  try {
    const page = await getHomeSections();
    const ordered = page.results
      .filter((section) => section.is_active)
      // A key the site has no component for is skipped rather than rendered as
      // a gap: the panel's list and this build can be a deploy apart.
      .filter((section): section is typeof section & { key: HomeSectionKey } =>
        (HOME_SECTION_KEYS as readonly string[]).includes(section.key),
      )
      .sort((a, b) => a.order - b.order)
      .map((section) => section.key);

    return ordered.length > 0 ? ordered : SHIPPED_ORDER;
  } catch {
    return SHIPPED_ORDER;
  }
}
