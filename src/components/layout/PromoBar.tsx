import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { TagIcon } from "@/components/ui/icons";
import { getPromoBar } from "@/lib/api/company";
import { contactHref } from "@/lib/utils/contact-link";

/*
 * The current offer, across the top of every page — panel-controlled, so the
 * wording and code can change with a season without a deploy.
 *
 * Unconditional and server-rendered when there is one: this used to carry a
 * dismiss button and a `localStorage` flag remembering that choice, but the
 * offer is a standing one, not a one-time announcement, and a visitor should
 * not be able to make it disappear for good. Returning null is now the
 * editor's own call — switching the strip off in the panel — rather than a
 * visitor's, and does not reintroduce that mechanism.
 */
export async function PromoBar() {
  const [promo, locale, t] = await Promise.all([
    getPromoBar().catch(() => null),
    getLocale(),
    getTranslations("Promo"),
  ]);

  if (!promo) return null;

  const isArabic = locale === "ar";
  const headline = isArabic ? promo.headline_ar : promo.headline_en;
  const ctaLabel = isArabic ? promo.cta_label_ar : promo.cta_label_en;
  // Blank sends the reader to the contact form carrying the code, so the
  // agent reading the enquiry knows a discount was promised.
  const href = promo.link || contactHref({ promo: promo.code || undefined });

  return (
    <div className="relative z-60 bg-linear-to-r from-navy-900 via-navy-700 to-navy-900 text-white">
      <Container className="flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm">
        <TagIcon aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-gold-400 sm:block" />

        <span className="font-medium">{headline}</span>

        {/* The code is the one thing here that has to be copied exactly, so it
            is set apart rather than run into the sentence. Omitted when the
            offer needs none. */}
        {promo.code ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/70">{t("codeLabel")}</span>
            <code
              dir="ltr"
              className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-gold-300"
            >
              {promo.code}
            </code>
          </span>
        ) : null}

        <Link
          href={href}
          className="rounded-full bg-gold-500 px-3.5 py-1 text-xs font-bold text-navy-900 transition-colors hover:bg-gold-400"
        >
          {ctaLabel}
        </Link>
      </Container>
    </div>
  );
}
