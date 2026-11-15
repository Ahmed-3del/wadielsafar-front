import { MediaImage } from "@/components/ui/MediaImage";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Hotel } from "@/types/hotel";
import { formatPrice } from "@/lib/utils/format-date";
import { StarRating } from "@/components/ui/StarRating";

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const locale = useLocale();
  const t = useTranslations("Hotels");
  const isArabic = locale === "ar";
  const name = isArabic ? hotel.name_ar : hotel.name_en;
  const destination = isArabic ? hotel.destination.name_ar : hotel.destination.name_en;
  const image = hotel.cover_image;

  return (
    <Link
      href={`/hotels/${hotel.slug}`}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white"
    >
      <div className="relative aspect-video w-full">
        <MediaImage
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 42vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <StarRating
          value={hotel.star_rating}
          label={t("starRating", { count: hotel.star_rating })}
          className="text-xs sm:text-sm"
        />
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-navy-900 sm:text-base">{name}</h3>
        <p className="mt-1 truncate text-xs text-sand-500 sm:text-sm">
          {destination}
          {isArabic ? "، " : ", "}
          {isArabic ? hotel.destination.country_ar : hotel.destination.country_en}
        </p>
        {/* mt-auto keeps the price on the same line across a row of cards
            whose names and locations wrap to different heights. */}
        <p className="mt-auto pt-2 text-sm font-semibold text-gold-700 sm:pt-2.5 sm:text-base">
          {t("priceFrom", {
            price: formatPrice(hotel.price_per_night_from, locale, hotel.currency),
          })}
          <span className="ms-1 text-xs font-normal text-sand-500 sm:text-sm">{t("perNight")}</span>
        </p>
      </div>
    </Link>
  );
}
