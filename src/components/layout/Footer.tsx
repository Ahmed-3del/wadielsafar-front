import type { ComponentType, SVGProps } from "react";
import Image from "next/image";
import footerScene from "@/assets/footer-scene.webp";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { resolveNav } from "@/lib/api/resolve-nav";
import { resolveFooter } from "@/lib/api/resolve-footer";
import { BranchCard } from "@/components/branches/BranchCard";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { CertificateWall } from "@/components/layout/CertificateWall";
import type { ResolvedNavItem } from "@/types/nav-item";
import type { SocialPlatform } from "@/types/company";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import {
  FacebookIcon,
  MailIcon,
  InstagramIcon,
  LinkedinIcon,
  SnapchatIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/*
 * Keyed on the platform the panel records rather than matched against the URL.
 * A vanity or shortened domain used to render as no icon at all, and the
 * person adding the link had no way to say which network it was.
 *
 * A platform with no mark here is skipped rather than shown as a mystery
 * square — the backend's SocialPlatformChoices and this map are meant to be
 * changed together.
 */
const SOCIAL_MARKS: Record<SocialPlatform, { label: string; Icon: IconComponent } | undefined> = {
  FACEBOOK: { label: "Facebook", Icon: FacebookIcon },
  INSTAGRAM: { label: "Instagram", Icon: InstagramIcon },
  TIKTOK: { label: "TikTok", Icon: TiktokIcon },
  SNAPCHAT: { label: "Snapchat", Icon: SnapchatIcon },
  X: { label: "X", Icon: XIcon },
  YOUTUBE: { label: "YouTube", Icon: YoutubeIcon },
  LINKEDIN: { label: "LinkedIn", Icon: LinkedinIcon },
  WHATSAPP: { label: "WhatsApp", Icon: WhatsAppIcon },
};

/*
 * A plain list, and deliberately not a <details> disclosure. Collapsing the
 * columns on a phone and reopening them from CSS at wider widths does not
 * work: a closed <details> hides its body with content-visibility, which
 * cannot be overridden — the columns vanished on desktop. Sitting the two
 * lists side by side on a phone saves the same height with no mechanism.
 */
function LinkColumn({
  title,
  items,
  className,
}: {
  title: string;
  items: ResolvedNavItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      <ul className="mt-3 space-y-1 sm:space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block py-1 text-sm text-sand-600 transition-colors hover:text-gold-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const [tFooter, tBrand, tWa, tCommon, locale, nav, footer] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Brand"),
    getTranslations("Whatsapp"),
    getTranslations("Common2"),
    getLocale(),
    resolveNav(),
    resolveFooter(),
  ]);
  const isArabic = locale === "ar";
  const year = new Date().getFullYear();

  /* The two link columns used to be primary.slice(0, 6) and primary.slice(1, 7)
     — five of the six links were the same in both, which is what made the
     footer read as padding. They are split by what the entries are instead:
     the services the agency sells, and everything else. Both lists still come
     from the panel, so adding a page there still lands here. */
  const services = nav.primary.filter((item) => item.href !== "/");
  const home = nav.primary.filter((item) => item.href === "/");
  const quickLinks = [...home, ...nav.secondary];

  /*
   * One sand panel from here down. The illustration's own page tone is within
   * a few units of it, so the scene sits on the panel with no seam to line up
   * — and the hairline above marks the footer on pages whose last section is
   * already sand.
   */
  return (
    <footer className="border-t border-sand-200 bg-sand-50">
      <Container className="pt-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold-700 sm:text-sm">
          {tFooter("skylineCaption")}
        </p>
      </Container>

      {/* Edge to edge. The artwork is composed as a banner rather than cropped
          into one, so it needs no trimming and lands at 416px tall across a
          1440px viewport.

          Stored at 2x so retina screens are not upscaling it, and asks for
          quality 90: the picture is mostly soft sand gradients, which is where
          the default 75 shows banding.

          Imported rather than referenced by a /public path. The optimizer keys
          its cache on the URL, so replacing a public file under the same name
          keeps serving the old derivatives — which is exactly what happened
          twice here. An import gets a content-hashed URL, and carries its own
          dimensions so they cannot drift from the file.

          Decorative, and below the fold: no alt text, no preload. */}
      <div className="mx-auto w-full max-w-[1800px]">
        <Image
          src={footerScene}
          alt=""
          aria-hidden="true"
          quality={90}
          sizes="(min-width: 1800px) 1800px, 100vw"
          className="footer-scene h-auto w-full"
        />
      </div>

      <div>
        {/* A 12-column grid rather than four equal ones. The brand blurb and
            the contact block both need more room than a list of six links, and
            splitting the row evenly is what left the link columns airy and the
            contact column cramped. */}
        <Container className="grid grid-cols-2 gap-x-8 gap-y-10 pb-10 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Logo name={tBrand("name")} variant="full" />
            <p className="mt-3 max-w-xs text-sm leading-6 text-sand-600">
              {tFooter("description")}
            </p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-sand-500">
              {tFooter("socialTitle")}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {footer.socials.map((social) => {
                const mark = SOCIAL_MARKS[social.platform];
                if (!mark) return null;
                return (
                  <li key={social.url}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={mark.label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-sand-200 bg-white text-navy-700 transition-colors hover:border-gold-500 hover:text-gold-700"
                    >
                      <mark.Icon className="h-4.5 w-4.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <LinkColumn
            title={tFooter("servicesTitle")}
            items={services}
            className="lg:col-span-3"
          />
          {quickLinks.length > 1 ? (
            <LinkColumn
              title={tFooter("quickLinksTitle")}
              items={quickLinks}
              className="lg:col-span-2"
            />
          ) : null}

          <div className="col-span-2 lg:col-span-3">
            <p className="text-sm font-semibold text-navy-900">{tFooter("contactTitle")}</p>
            {/* Tappable rather than printed: on the device most of these
                visitors are holding, a phone number is a button.

                dir="ltr" sits on the value itself, not on the row — on the row
                it drags the whole line to the left edge of an otherwise
                right-aligned column. */}
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="flex items-center gap-2.5 py-2 text-sand-600 transition-colors hover:text-gold-700 sm:py-1.5"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-sand-400" />
                  <span dir="ltr">{siteConfig.contactEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(tWa("message"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 py-2 font-medium text-navy-900 transition-colors hover:text-whatsapp sm:py-1.5"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-whatsapp" />
                  {tFooter("whatsappLine")}
                </a>
              </li>
            </ul>

            {/* The footer's job for someone who scrolled this far is to make
                the next step obvious, not to make them go hunting for it. */}
            <Link
              href="/contact"
              className={cn(buttonVariants("primary", "sm"), "mt-4 w-full sm:w-auto")}
            >
              {tCommon("bookNow")}
            </Link>
          </div>
        </Container>

        {/* The offices, as the same cards the homepage used to carry: map,
            written address, a number to ring and a way to navigate. They live
            here alone now — a section of them on the homepage and a row of
            them down here was the same content twice, and the footer is where
            someone looks for an address on every page rather than one. */}
        <Container className="border-t border-sand-200 py-8">
          <p className="text-sm font-semibold text-navy-900">{tFooter("branchesTitle")}</p>
          {/* auto-fit + a capped track width, rather than a fixed
              sm:grid-cols-2 lg:grid-cols-4: with fractional columns, fewer
              branches than columns still stretched to fill every column,
              leaving the row pinned to the start with empty tracks trailing
              it instead of sitting centered. auto-fit collapses the tracks
              nobody needs and justify-center centers what's left, at every
              width, with no per-breakpoint column count to keep in sync. */}
          <ScrollGrid
            label={tFooter("branchesTitle")}
            gridClassName="sm:grid-cols-[repeat(auto-fit,minmax(240px,300px))] sm:justify-center"
            className="mt-4"
          >
            {footer.branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </ScrollGrid>
        </Container>

        {/* Trust marks only take a row when the panel actually has some —
            the heading used to render unconditionally and sat over an empty
            strip whenever certificates were empty. */}
        {footer.certificates.length > 0 ? (
          <Container className="border-t border-sand-200 py-8">
            <p className="text-sm font-semibold text-navy-900">{tFooter("credentialsTitle")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CertificateWall certificates={footer.certificates} />
            </div>
          </Container>
        ) : null}

        {/* One strip: the brand and its copyright on one side, the licence
            numbers a Saudi travel agency is required to publish on the
            other. A vertical divider between each number reads as one row of
            credentials rather than a wrapped paragraph of them. */}
        <div className="border-t border-sand-200 py-6">
          <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
            <div>
              <p className="flex items-center justify-center gap-2 text-base font-semibold text-navy-900 sm:justify-start">
                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-gold-500" />
                {tBrand("name")}
              </p>
              <p className="mt-1 text-xs text-sand-500">
                &copy; {year} {tFooter("rights")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-base text-sand-600 sm:justify-end">
              <span>
                {tFooter("taxNumber")}:{" "}
                <span dir="ltr" className="font-semibold text-navy-900">
                  {siteConfig.registration.taxNumber}
                </span>
              </span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-sand-300 sm:inline-block" />
              <span>
                {tFooter("commercialRegistry")}:{" "}
                <span dir="ltr" className="font-semibold text-navy-900">
                  {siteConfig.registration.commercialRegistry}
                </span>
              </span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-sand-300 sm:inline-block" />
              <span>
                {tFooter("licenseCategory")}:{" "}
                <span className="font-semibold text-navy-900">
                  {isArabic
                    ? siteConfig.registration.licenseCategoryAr
                    : siteConfig.registration.licenseCategoryEn}
                </span>
              </span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-sand-300 sm:inline-block" />
              <span>
                {tFooter("tourismLicense")}:{" "}
                <span dir="ltr" className="font-semibold text-navy-900">
                  {siteConfig.registration.tourismLicense}
                </span>
              </span>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
