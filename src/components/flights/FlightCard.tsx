import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { PlaneIcon } from "@/components/ui/icons";
import type { FlightDeal } from "@/types/flight";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { FlightRoute } from "./FlightRoute";

interface FlightCardProps {
  flight: FlightDeal;
}

const badgeClass = "rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-sand-700";

/*
 * Same "photo, then a badge stamped over its seam" pairing as VisaCard: a
 * picture of the route behind, the airline mark stamped where the photo
 * meets the card body. Neither is required — a deal with no cover on file
 * still gets the brand-coloured block every other card falls back to, and
 * one with no airline logo gets a plane mark instead of a blank circle.
 */
export function FlightCard({ flight }: FlightCardProps) {
  const locale = useLocale();
  const t = useTranslations("Flights");
  const isArabic = locale === "ar";
  // airline_name_ar is optional upstream; the English name is the fallback.
  const airline =
    (isArabic ? flight.airline_name_ar : flight.airline_name_en) || flight.airline_name_en;
  const destination = isArabic ? flight.destination_city_ar : flight.destination_city_en;

  return (
    <Link
      href={`/flights/${flight.slug}`}
      className="card-lift group relative flex h-full flex-col rounded-2xl border border-sand-200 bg-white"
    >
      <div className="relative">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
          <MediaImage
            src={flight.cover_image}
            alt={destination}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 72vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-sand-100">
            {flight.airline_logo ? (
              <Image
                src={flight.airline_logo}
                alt={airline}
                width={48}
                height={48}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <PlaneIcon className="h-5 w-5 text-navy-700" />
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-7">
        {airline ? <p className="text-center text-sm text-sand-500">{airline}</p> : null}

        {/* text-base rather than text-lg: at the old size the two city names
            plus their codes routinely wrapped to a second line on a card this
            narrow, which cost as much height as one of the badges below. */}
        <FlightRoute
          origin={isArabic ? flight.origin_city_ar : flight.origin_city_en}
          originCode={flight.origin_airport_code}
          destination={destination}
          destinationCode={flight.destination_airport_code}
          className="mt-2.5 text-base"
        />

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className={badgeClass}>{t(`tripTypes.${flight.trip_type}`)}</span>
          <span className={badgeClass}>{t(`cabinClasses.${flight.cabin_class}`)}</span>
          {flight.baggage_allowance_kg !== null ? (
            <span className={badgeClass}>{t("baggage", { kg: flight.baggage_allowance_kg })}</span>
          ) : null}
        </div>

        {flight.departure_date ? (
          /* Each date is one unbreakable run. Written as a single sentence, a
             narrow card wrapped between the day and the month — "العودة: 3" on
             one line and "أكتوبر 2026" on the next, which reads as a bug. The
             separator stays on the first line, where a trailing "·" reads as
             "continued". */
          <p className="mt-2 flex flex-wrap gap-x-1.5 text-sm text-sand-500">
            <span className="whitespace-nowrap">
              {t("departure")}: {formatDate(flight.departure_date, locale)}
              {flight.return_date ? " ·" : null}
            </span>
            {flight.return_date ? (
              <span className="whitespace-nowrap">
                {t("returnDate")}: {formatDate(flight.return_date, locale)}
              </span>
            ) : null}
          </p>
        ) : null}

        <p className="mt-auto pt-2.5 text-base font-semibold text-gold-700">
          {t("priceFrom", { price: formatPrice(flight.price_from, locale, flight.currency) })}
        </p>
      </div>
    </Link>
  );
}
