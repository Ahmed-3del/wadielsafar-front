import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { ChevronForwardIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  /** Featured cards carry the section's visual weight; the rest support it. */
  featured?: boolean;
  className?: string;
}

export function DestinationCard({ destination, featured, className }: DestinationCardProps) {
  const locale = useLocale();
  const t = useTranslations("DestinationsPage");
  const isArabic = locale === "ar";
  const name = isArabic ? destination.name_ar : destination.name_en;
  const country = isArabic ? destination.country_ar : destination.country_en;

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-navy-900",
        featured ? "min-h-88 lg:min-h-full" : "min-h-64",
        className,
      )}
    >
      <MediaImage
        src={destination.cover_image}
        alt={name}
        fill
        sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
      />
      {/* Gradient scrim: keeps the label readable over any photograph without
          dimming the whole image. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-navy-950/85 via-navy-950/25 to-transparent"
      />

      <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
          {country}
        </p>
        <h3
          className={cn(
            "mt-1.5 font-bold text-white",
            featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
          )}
        >
          {name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/0 transition-colors duration-300 group-hover:text-white">
          {t("explore")}
          <ChevronForwardIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
