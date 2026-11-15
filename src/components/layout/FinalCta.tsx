import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ChevronForwardIcon, HeadsetIcon } from "@/components/ui/icons";

/*
 * The closing nudge, as a slim strip rather than a full navy band — the same
 * shape as the loyalty banner, so the page ends on something the size of a
 * button, not a second hero. The whole strip is the link.
 */
export async function FinalCta() {
  const t = await getTranslations("FinalCta");

  return (
    <section className="py-4 sm:py-6">
      <Container>
        <Link
          href="/contact"
          className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-navy-900 p-3 transition-shadow hover:shadow-lg sm:gap-5 sm:p-4"
        >
          {/* Ambient glow. Decorative only. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-gold-500/15 blur-2xl"
          />

          <span
            aria-hidden="true"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/15 text-gold-400 sm:h-12 sm:w-12"
          >
            <HeadsetIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>

          <span className="relative min-w-0 flex-1">
            <span className="block text-sm font-bold leading-snug text-white sm:text-base">
              {t("title")}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-white/60 sm:text-sm">
              {t("description")}
            </span>
          </span>

          <span className="relative inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-500 px-3 py-2 text-xs font-bold text-navy-900 sm:px-4 sm:text-sm">
            <span className="max-sm:sr-only">{t("cta")}</span>
            <ChevronForwardIcon className="h-4 w-4" />
          </span>
        </Link>
      </Container>
    </section>
  );
}
