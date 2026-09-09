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
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 85vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {pkg.is_featured ? (
          <Badge tone="gold" className="absolute start-3 top-3 shadow-sm">
            {t("badgeFeatured")}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
          {destination}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-navy-900">
          {/* Stretched link: the whole card is the target, but only the title
              is announced as the link. */}
          <Link href={`/packages/${pkg.slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm text-sand-600">
          {t("durationNights", { days: pkg.duration_days, nights })}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="text-xs text-sand-500">{t("startingFrom")}</p>
            <p className="text-lg font-bold text-navy-900">{formatPrice(pkg.price_from, locale)}</p>
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
