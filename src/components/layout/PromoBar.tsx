import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { TagIcon } from "@/components/ui/icons";

/*
 * The new-customer offer, across the top of every page.
 *
 * Unconditional and server-rendered: this used to carry a dismiss button and
 * a `localStorage` flag remembering that choice, but the offer is a standing
 * one, not a one-time announcement, and a visitor should not be able to make
 * it disappear for good. Removing the mechanism rather than leaving it unwired
 * closes the door a re-added button — or an old flag already sitting in
 * someone's browser from before this was decided — would otherwise walk
 * back through.
 */
export async function PromoBar() {
  const t = await getTranslations("Promo");

  return (
    <div className="relative z-60 bg-linear-to-r from-navy-900 via-navy-700 to-navy-900 text-white">
      <Container className="flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm">
        <TagIcon aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-gold-400 sm:block" />

        <span className="font-medium">{t("headline")}</span>

        {/* The code is the one thing here that has to be copied exactly, so it
            is set apart rather than run into the sentence. */}
        <span className="inline-flex items-center gap-1.5">
          <span className="text-white/70">{t("codeLabel")}</span>
          <code
            dir="ltr"
            className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-gold-300"
          >
            {t("code")}
          </code>
        </span>

        <Link
          href="/contact"
          className="rounded-full bg-gold-500 px-3.5 py-1 text-xs font-bold text-navy-900 transition-colors hover:bg-gold-400"
        >
          {t("cta")}
        </Link>
      </Container>
    </div>
  );
}
