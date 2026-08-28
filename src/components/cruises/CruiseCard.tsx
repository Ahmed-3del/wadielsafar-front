import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { Badge } from "@/components/ui/Badge";
import { CalendarIcon, ChevronForwardIcon, ShipIcon } from "@/components/ui/icons";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import type { Cruise } from "@/types/cruise";

export function CruiseCard({ cruise, className }: { cruise: Cruise; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Cruises");
  const isArabic = locale === "ar";
  const title = isArabic ? cruise.title_ar : cruise.title_en;
  const line = isArabic ? cruise.cruise_line_ar : cruise.cruise_line_en;
  const port = isArabic ? cruise.departure_port_ar : cruise.departure_port_en;
  // Sold in nights; the day count is derived so the two can never disagree.
  const days = cruise.duration_nights + 1;

  return (
    <article
      className={cn(
        "card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <MediaImage
          src={cruise.cover_image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {cruise.is_featured ? (
          <Badge tone="gold" className="absolute start-3 top-3 shadow-sm">
            {t("badgeFeatured")}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {line ? (
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-700">
            <ShipIcon className="h-3.5 w-3.5" />
            {line}
          </p>
        ) : null}
        <h3 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-navy-900">
          <Link href={`/cruises/${cruise.slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-sand-600">
          {t("durationNights", { days, nights: cruise.duration_nights })}
        </p>
        {port ? <p className="mt-1 text-sm text-sand-500">{t("departsFrom", { port })}</p> : null}
        {/* The sail date is what a cruise is actually sold on, so it reads as
            a fact about the trip rather than as small print. */}
        {cruise.departure_date ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-navy-900">
            <CalendarIcon className="h-4 w-4 text-gold-600" />
            {t("departsOn", { date: formatDate(cruise.departure_date, locale) })}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-sand-500">{t("startingFrom")}</p>
            <p className="text-xl font-bold text-navy-900">
              {formatPrice(cruise.price_from, locale)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {t("discover")}
            <ChevronForwardIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
