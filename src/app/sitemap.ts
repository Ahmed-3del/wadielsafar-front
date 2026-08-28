import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";

const staticPaths = [
  "",
  "/flights",
  "/hotels",
  "/packages",
  "/visas",
  "/cruises",
  "/offers",
  "/corporate",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified,
      // Each entry names its counterparts, so the two locales are indexed as
      // one page in two languages rather than as duplicates of each other.
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
          ),
          "x-default": `${siteConfig.url}/${routing.defaultLocale}${path}`,
        },
      },
    })),
  );
}
