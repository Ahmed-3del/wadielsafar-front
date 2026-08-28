import { useLocale } from "next-intl";
import type { HotelAmenity } from "@/types/hotel";

interface AmenityListProps {
  amenities: HotelAmenity[];
}

export function AmenityList({ amenities }: AmenityListProps) {
  const locale = useLocale();

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <li key={amenity.id} className="rounded-full bg-sand-100 px-3 py-1 text-sm text-sand-700">
          {locale === "ar" ? amenity.name_ar : amenity.name_en}
        </li>
      ))}
    </ul>
  );
}
