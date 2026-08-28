import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FlightDeal } from "@/types/flight";
import { formatDate, formatPrice } from "@/lib/utils/format-date";
import { FlightRoute } from "./FlightRoute";

interface FlightCardProps {
  flight: FlightDeal;
}

const badgeClass = "rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-700";

export function FlightCard({ flight }: FlightCardProps) {
  const locale = useLocale();
  const t = useTranslations("Flights");
  const isArabic = locale === "ar";
  // airline_name_ar is optional upstream; the English name is the fallback.
  const airline =
    (isArabic ? flight.airline_name_ar : flight.airline_name_en) || flight.airline_name_en;

  return (
    <Link
      href={`/flights/${flight.slug}`}
      className="card-lift flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-5"
    >
      {airline ? (
        <div className="flex items-center gap-2">
          {flight.airline_logo ? (
            <Image
              src={flight.airline_logo}
              alt={airline}
              width={28}
              height={28}
              className="rounded object-contain"
            />
          ) : null}
          <span className="text-sm text-sand-500">{airline}</span>
        </div>
      ) : null}

      <FlightRoute
        origin={isArabic ? flight.origin_city_ar : flight.origin_city_en}
        originCode={flight.origin_airport_code}
        destination={isArabic ? flight.destination_city_ar : flight.destination_city_en}
        destinationCode={flight.destination_airport_code}
        className="mt-3 text-lg"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={badgeClass}>{t(`tripTypes.${flight.trip_type}`)}</span>
        <span className={badgeClass}>{t(`cabinClasses.${flight.cabin_class}`)}</span>
        {flight.baggage_allowance_kg !== null ? (
          <span className={badgeClass}>{t("baggage", { kg: flight.baggage_allowance_kg })}</span>
        ) : null}
      </div>

      {flight.departure_date ? (
        <p className="mt-3 text-sm text-sand-500">
          {t("departure")}: {formatDate(flight.departure_date, locale)}
          {flight.return_date
            ? ` · ${t("returnDate")}: ${formatDate(flight.return_date, locale)}`
            : null}
        </p>
      ) : null}

      <p className="mt-auto pt-3 text-base font-semibold text-gold-700">
        {t("priceFrom", { price: formatPrice(flight.price_from, locale, flight.currency) })}
      </p>
    </Link>
  );
}
