import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { GiftIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/*
 * The loyalty programme lives on Orbit, not on this site — sign-in, joining,
 * and adding the card to Apple/Google Wallet all already work there. This
 * banner's only job is to make sure a visitor notices it exists.
 *
 * A light dashed strip, as the client's reference has it: a miniature member
 * card, one title, one line, and a "join free" button. Light rather than navy
 * so it reads as an invitation sitting between sections, not a section of its
 * own. The whole strip is the link.
 */
export async function LoyaltyBanner() {
  const [t, tBrand] = await Promise.all([getTranslations("Loyalty"), getTranslations("Brand")]);

  return (
    <section className="py-4 sm:py-6">
      <Container>
        <a
          href={siteConfig.orbitLoyaltyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-2xl border border-dashed border-navy-300 bg-white p-3 transition-colors hover:border-gold-500 sm:gap-4 sm:px-5 sm:py-4"
        >
          {/* The member card, in miniature. Decorative. */}
          <span
            aria-hidden="true"
            className="flex aspect-[85/54] w-16 shrink-0 flex-col justify-between rounded-md bg-gradient-to-br from-navy-700 to-navy-950 p-1.5 shadow-sm transition-transform duration-300 group-hover:-rotate-3 sm:w-20 sm:rounded-lg sm:p-2"
          >
            <span className="flex items-start justify-between">
              <span className="h-2 w-3 rounded-[2px] bg-gradient-to-br from-gold-300 to-gold-600 sm:h-2.5 sm:w-3.5" />
              <GiftIcon className="h-2.5 w-2.5 text-gold-400 sm:h-3 sm:w-3" />
            </span>
            <span className="truncate text-[7px] font-bold text-white sm:text-[9px]">
              {tBrand("name")}
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-navy-900 sm:text-base">
              {t("eyebrow")}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-sand-600 sm:text-sm">
              {t("short")}
            </span>
          </span>

          <span className="shrink-0 rounded-lg border border-navy-700 px-3 py-2 text-xs font-bold text-navy-800 transition-colors group-hover:bg-navy-900 group-hover:text-white sm:px-6 sm:py-2.5 sm:text-sm">
            {t("join")}
          </span>
        </a>
      </Container>
    </section>
  );
}
