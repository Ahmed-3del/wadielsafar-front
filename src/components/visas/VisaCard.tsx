import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { ClockIcon, PassportIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import type { VisaType } from "@/types/visa";

/*
 * A visa card must answer the four questions a traveller actually has —
 * which visa, how much, how long, how do I start — without a second click.
 * Direct KSA hides price and processing time behind the country page; that is
 * the gap this closes.
 */
export function VisaCard({ visa, className }: { visa: VisaType; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Visas");
  const isArabic = locale === "ar";
  const country = isArabic ? visa.country.name_ar : visa.country.name_en;
  const name = isArabic ? visa.name_ar : visa.name_en;

  return (
    <article
      className={cn(
        "card-lift group flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">{country}</p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-navy-900">{name}</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
          <PassportIcon className="h-5 w-5" />
        </span>
      </div>

      <dl className="mb-5 mt-5 grid grid-cols-2 gap-4 border-y border-sand-200 py-4">
        <div>
          <dt className="text-xs text-sand-500">{t("price")}</dt>
          <dd className="mt-0.5 text-lg font-bold text-navy-900">
            {formatPrice(visa.price, locale)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-sand-500">
            <ClockIcon className="h-3.5 w-3.5" />
            {t("processingLabel")}
          </dt>
          <dd className="mt-0.5 text-lg font-bold text-navy-900">
            {t("days", { days: visa.processing_time_days })}
          </dd>
        </div>
        {visa.validity_days ? (
          <div className="col-span-2 border-t border-sand-200 pt-3">
            <dt className="text-xs text-sand-500">{t("validityLabel")}</dt>
            <dd className="mt-0.5 font-semibold text-navy-900">
              {t("days", { days: visa.validity_days })}
            </dd>
          </div>
        ) : null}
      </dl>

      <Link
        href={`/visas/${visa.id}`}
        className={cn(buttonVariants("primary", "md"), "mt-auto w-full")}
      >
        {t("apply")}
      </Link>
    </article>
  );
}
