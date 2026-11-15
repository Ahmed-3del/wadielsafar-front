import { MediaImage } from "@/components/ui/MediaImage";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Offer } from "@/types/offer";
import { formatDate } from "@/lib/utils/format-date";
import { getOfferPricing } from "@/lib/utils/pricing";

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const locale = useLocale();
  const t = useTranslations("Offers");
  const title = locale === "ar" ? offer.title_ar : offer.title_en;
  const image = offer.image;
  const pricing = getOfferPricing(offer, locale);

  return (
    <Link
      href={`/offers/${offer.slug}`}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white"
    >
      <div className="relative aspect-video w-full">
        <MediaImage
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 42vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {pricing.discountPercentage !== null ? (
          <span className="absolute start-2 top-2 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] sm:start-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs font-semibold text-navy-900">
            {t("discount", { percent: pricing.discountPercentage })}
          </span>
        ) : null}
        {offer.status !== "ACTIVE" ? (
          <span className="absolute end-2 top-2 rounded-full bg-navy-900/80 px-2 py-0.5 text-[10px] sm:end-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs font-semibold text-white">
            {t(`statuses.${offer.status}`)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-navy-900 sm:text-base">{title}</h3>
        {pricing.current ? (
          <p className="mt-1.5 flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-gold-700 sm:text-base">{pricing.current}</span>
            {pricing.strikethrough ? (
              <>
                <span className="sr-only">{t("was", { price: pricing.strikethrough })}</span>
                <span aria-hidden="true" className="text-xs text-sand-400 line-through sm:text-sm">
                  {pricing.strikethrough}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="mt-auto pt-1 text-xs text-sand-500 sm:text-sm">
          {t("until", { date: formatDate(offer.ends_at, locale) })}
        </p>
      </div>
    </Link>
  );
}
