import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { HeaderMenu } from "@/components/navigation/HeaderMenu";
import { LocaleSwitcher } from "@/components/navigation/LocaleSwitcher";
import { Logo } from "@/components/layout/Logo";
import { PhoneIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { resolveNav } from "@/lib/api/resolve-nav";

/*
 * Logo, phone number, menu. That is the whole header now.
 *
 * The eight-item nav bar that used to sit here is in the menu instead: the
 * search moved up to directly under this bar, and a row of links between the
 * two pushed it down the page for no gain. The phone number takes the space
 * the links vacated because this agency closes on the phone — it is the one
 * thing in the header worth making unmissable.
 */
export async function Header() {
  const [t, tCommon, nav] = await Promise.all([
    getTranslations("Brand"),
    getTranslations("Common2"),
    resolveNav(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/80 bg-white/95 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3 lg:h-20">
        <Link href="/" aria-label={t("name")} className="shrink-0">
          <Logo name={t("name")} priority />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* dir="ltr" on the number itself, not the row: a phone number reads
              left to right in both languages, but the label around it must
              not. */}
          <a
            href={`tel:${siteConfig.contactPhone}`}
            className="group flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 px-3 py-2 transition-colors hover:border-gold-500 hover:bg-gold-100 sm:px-4"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-500 text-navy-900">
              <PhoneIcon className="h-3.5 w-3.5" />
            </span>
            <span className="flex flex-col leading-tight">
              {/* The label is the part that disappears first on a narrow
                  screen; the number never does. */}
              <span className="hidden text-[10px] font-medium text-sand-600 sm:block">
                {tCommon("callUs")}
              </span>
              <span dir="ltr" className="whitespace-nowrap text-sm font-bold text-navy-900 sm:text-base">
                {siteConfig.contactPhoneDisplay}
              </span>
            </span>
          </a>

          {/* Two 60px pills are the widest thing in this bar and the least
              urgent: below sm they would push the phone number off the edge,
              so they move into the menu instead. */}
          <LocaleSwitcher className="hidden sm:flex" />
          <HeaderMenu primary={nav.primary} secondary={nav.secondary} />
        </div>
      </Container>
    </header>
  );
}
