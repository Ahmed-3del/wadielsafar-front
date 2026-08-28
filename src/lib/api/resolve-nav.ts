import { getTranslations, getLocale } from "next-intl/server";
import { getNavItems } from "./navigation";
import { fallbackPrimaryNav, fallbackSecondaryNav } from "@/lib/constants/nav";
import type { ResolvedNavItem } from "@/types/nav-item";

/*
 * Resolves the editable navigation for the current locale, falling back to the
 * routes the app ships with.
 *
 * The fallback fires on a failed request *and* on an empty list. An empty list
 * is almost always a misconfiguration rather than an intention — nobody means
 * to publish a site with no navigation — and a header of last-known-good links
 * is recoverable in a way that a header of nothing is not.
 */
export async function resolveNav(): Promise<{
  primary: ResolvedNavItem[];
  secondary: ResolvedNavItem[];
}> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Nav")]);
  const isArabic = locale === "ar";

  const shippedNav = () => ({
    primary: fallbackPrimaryNav.map((item) => ({ href: item.href, label: t(item.labelKey) })),
    secondary: fallbackSecondaryNav.map((item) => ({ href: item.href, label: t(item.labelKey) })),
  });

  try {
    const items = await getNavItems();
    const pick = (group: "PRIMARY" | "SECONDARY") =>
      items
        .filter((item) => item.group === group)
        .map((item) => ({ href: item.href, label: isArabic ? item.label_ar : item.label_en }));

    const primary = pick("PRIMARY");
    if (primary.length === 0) return shippedNav();

    return { primary, secondary: pick("SECONDARY") };
  } catch {
    return shippedNav();
  }
}
