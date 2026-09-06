import { getTranslations } from "next-intl/server";
import { getBranches, getCertificates, getSocialLinks } from "@/lib/api/company";
import { siteConfig } from "@/config/site";
import type { Branch, Certificate, SocialPlatform } from "@/types/company";

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
  branches: Branch[];
  socials: ResolvedSocial[];
  certificates: Certificate[];
}> {
  const t = await getTranslations("Footer");

  /*
   * The numbers the site shipped with, shaped as branch records so the footer
   * renders one kind of card either way. They carry no address and no pin —
   * the card shows a plain block where the map goes rather than inventing a
   * location, and the panel is where the real ones are filled in.
   */
  const shippedBranches = (): Branch[] =>
    siteConfig.branches.map((branch, index) => ({
      // Negative, so a fallback row can never collide with a real id.
      id: -(index + 1),
      name_ar: t(`branches.${branch.key}`),
      name_en: t(`branches.${branch.key}`),
      phone: branch.phone,
      phone_display: branch.display,
      address_ar: "",
      address_en: "",
      latitude: null,
      longitude: null,
      is_main: branch.key === "main",
      order: index,
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
    // The head office first, whatever its `order`: it is the one a first-time
    // visitor should read first.
    branches:
      branchRows.length > 0
        ? [...branchRows].sort(
            (a, b) => Number(b.is_main) - Number(a.is_main) || a.order - b.order,
          )
        : shippedBranches(),
    socials:
      socialRows.length > 0
        ? socialRows.map((link) => ({ platform: link.platform, url: link.url }))
        : shippedSocials(),
    certificates:
      certificatePage.status === "fulfilled" ? certificatePage.value.results : [],
  };
}
