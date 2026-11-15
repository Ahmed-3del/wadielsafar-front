import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { Badge } from "@/components/ui/Badge";
import { ChevronForwardIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import type { Package } from "@/types/package";

interface PackageCardProps {
  pkg: Package;
  className?: string;
}

export function PackageCard({ pkg, className }: PackageCardProps) {
  const locale = useLocale();
  const t = useTranslations("Packages");
  const isArabic = locale === "ar";
  const title = isArabic ? pkg.title_ar : pkg.title_en;
  const destination = isArabic ? pkg.destination.name_ar : pkg.destination.name_en;
  // Trips are quoted as days + nights in this market; nights is one fewer than
  // days for a return itinerary.
  const nights = Math.max(pkg.duration_days - 1, 0);

  return (
    <article
      className={cn(
        "card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white",
        className,
      )}
    >
      {/* aspect-video rather than the taller 4:3 this used to be — on a
          358px-wide mobile card that alone gives back about 65px, and a row
          of these no longer ran two-thirds of the way down a phone screen
          before the reader saw a price. */}
      <div className="relative aspect-video overflow-hidden">
        <MediaImage
          src={pkg.cover_image}
          alt={title}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 42vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {pkg.is_featured ? (
          <Badge tone="gold" className="absolute start-2 top-2 shadow-sm max-sm:px-2 max-sm:py-0.5 max-sm:text-[10px] sm:start-3 sm:top-3">
            {t("badgeFeatured")}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gold-700 sm:text-xs sm:tracking-widest">
          {destination}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-bold sm:mt-1 sm:text-base leading-snug text-navy-900">
          {/* Stretched link: the whole card is the target, but only the title
              is announced as the link. */}
          <Link href={`/packages/${pkg.slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-1 text-xs text-sand-600 sm:mt-1.5 sm:text-sm">
          {t("durationNights", { days: pkg.duration_days, nights })}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2 sm:pt-3">
          <div>
            <p className="text-[10px] text-sand-500 sm:text-xs">{t("startingFrom")}</p>
            <p className="text-sm font-bold text-navy-900 sm:text-lg">{formatPrice(pkg.price_from, locale)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-transform max-sm:hidden duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {t("discover")}
            <ChevronForwardIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
