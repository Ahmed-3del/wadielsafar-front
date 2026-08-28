import { getLocale, getTranslations } from "next-intl/server";
import { getBranches, getCertificates, getSocialLinks } from "@/lib/api/company";
import { siteConfig } from "@/config/site";
import type { Certificate, SocialPlatform } from "@/types/company";

export interface ResolvedBranch {
  key: string;
  name: string;
  /** Dialable, for the tel: href. */
  phone: string;
  /** Readable, for the eye. */
  display: string;
  /** Shown under the number when the panel has one. */
  address: string;
}

export interface ResolvedSocial {
  platform: SocialPlatform;
  url: string;
}

/** Only used by the fallback: rows from the API name their own platform. */
const HOST_PLATFORMS: { match: string; platform: SocialPlatform }[] = [
  { match: "facebook.", platform: "FACEBOOK" },
  { match: "instagram.", platform: "INSTAGRAM" },
  { match: "tiktok.", platform: "TIKTOK" },
  { match: "snapchat.", platform: "SNAPCHAT" },
  { match: "youtube.", platform: "YOUTUBE" },
  { match: "linkedin.", platform: "LINKEDIN" },
  { match: "x.com", platform: "X" },
];

/*
 * The footer's editable content, with the shipped values as a floor.
 *
 * Branches and social profiles fall back to what used to be hardcoded in
 * src/config/site.ts: an unreachable API must not leave the company with no
 * phone number on its own website. Certificates have no fallback on purpose —
 * these are government marks, and inventing a placeholder for one is worse
 * than showing nothing.
 */
export async function resolveFooter(): Promise<{
  branches: ResolvedBranch[];
  socials: ResolvedSocial[];
  certificates: Certificate[];
}> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Footer")]);
  const isArabic = locale === "ar";

  const shippedBranches = (): ResolvedBranch[] =>
    siteConfig.branches.map((branch) => ({
      key: branch.key,
      name: t(`branches.${branch.key}`),
      phone: branch.phone,
      display: branch.display,
      address: "",
    }));

  const shippedSocials = (): ResolvedSocial[] =>
    siteConfig.socialLinks.flatMap((url) => {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const match = HOST_PLATFORMS.find((entry) => host.includes(entry.match));
      return match ? [{ platform: match.platform, url }] : [];
    });

  const [branchPage, socialPage, certificatePage] = await Promise.allSettled([
    getBranches(),
    getSocialLinks(),
    getCertificates(),
  ]);

  const branchRows =
    branchPage.status === "fulfilled" ? branchPage.value.results : [];
  const socialRows =
    socialPage.status === "fulfilled" ? socialPage.value.results : [];

  return {
    // An empty list is treated like a failure: it means nobody has filled the
    // panel in yet, and a footer with no way to reach the company is worse
    // than one showing the numbers it shipped with.
    branches:
      branchRows.length > 0
        ? branchRows.map((branch) => ({
            key: String(branch.id),
            name: isArabic ? branch.name_ar : branch.name_en,
            phone: branch.phone,
            display: branch.phone_display || branch.phone,
            address: isArabic ? branch.address_ar : branch.address_en,
          }))
        : shippedBranches(),
    socials:
      socialRows.length > 0
        ? socialRows.map((link) => ({ platform: link.platform, url: link.url }))
        : shippedSocials(),
    certificates:
      certificatePage.status === "fulfilled" ? certificatePage.value.results : [],
  };
}
