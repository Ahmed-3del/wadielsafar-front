import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { MainNav } from "@/components/navigation/MainNav";
import { LocaleSwitcher } from "@/components/navigation/LocaleSwitcher";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { resolveNav } from "@/lib/api/resolve-nav";

export async function Header() {
  const [t, tWa, tCommon, nav] = await Promise.all([
    getTranslations("Brand"),
    getTranslations("Whatsapp"),
    getTranslations("Common2"),
    resolveNav(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/80 bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" aria-label={t("name")} className="shrink-0">
          <Logo name={t("name")} priority />
        </Link>

        <MainNav items={nav.primary} />

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(tWa("message"))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tWa("cta")}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-sand-200 text-whatsapp transition-all duration-200 hover:-translate-y-0.5 hover:border-whatsapp hover:shadow-md sm:inline-flex"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>

          <Link href="/contact" className={cn(buttonVariants("primary", "sm"), "hidden lg:inline-flex")}>
            {tCommon("bookNow")}
          </Link>

          <LocaleSwitcher />
        </div>
      </Container>
    </header>
  );
}
