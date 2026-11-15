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
    <header className="border-sand-200/80 sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md">
      {/* On a phone: a three-column grid with the logo alone in the middle and
          the menu at the end. The empty first cell is the menu button's twin,
          so the logo sits on the true centre of the screen rather than the
          centre of whatever space the button leaves. From sm up it is the
          logo-then-actions row it always was. */}
      <Container className="grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 sm:flex sm:justify-between lg:h-20">
        <span aria-hidden="true" className="sm:hidden" />

        <Link href="/" aria-label={t("name")} className="shrink-0 justify-self-center">
          <Logo name={t("name")} priority />
        </Link>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          {/* dir="ltr" on the number itself, not the row: a phone number reads
              left to right in both languages, but the label around it must
              not. */}
          <a
            href={`tel:${siteConfig.contactPhone}`}
            className="group border-gold-500/40 bg-gold-50 hover:border-gold-500 hover:bg-gold-100 hidden items-center gap-2 rounded-full border px-3 py-2 transition-colors sm:flex sm:px-4"
          >
            <span className="bg-gold-500 text-navy-900 grid h-7 w-7 shrink-0 place-items-center rounded-full">
              <PhoneIcon className="h-3.5 w-3.5" />
            </span>
            <span className="flex flex-col leading-tight">
              {/* The label is the part that disappears first on a narrow
                  screen; the number never does. */}
              <span className="text-sand-600 hidden text-[10px] font-medium sm:block">
                {tCommon("callUs")}
              </span>
              <span
                dir="ltr"
                className="text-navy-900 text-sm font-bold whitespace-nowrap sm:text-base"
              >
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
