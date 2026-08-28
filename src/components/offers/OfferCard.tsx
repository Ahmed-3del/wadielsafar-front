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
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {pricing.discountPercentage !== null ? (
          <span className="absolute start-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-navy-900">
            {t("discount", { percent: pricing.discountPercentage })}
          </span>
        ) : null}
        {offer.status !== "ACTIVE" ? (
          <span className="absolute end-3 top-3 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-semibold text-white">
            {t(`statuses.${offer.status}`)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        {pricing.current ? (
          <p className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold text-gold-700">{pricing.current}</span>
            {pricing.strikethrough ? (
              <>
                <span className="sr-only">{t("was", { price: pricing.strikethrough })}</span>
                <span aria-hidden="true" className="text-sm text-sand-400 line-through">
                  {pricing.strikethrough}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="mt-auto pt-1 text-sm text-sand-500">
          {t("until", { date: formatDate(offer.ends_at, locale) })}
        </p>
      </div>
    </Link>
  );
}
