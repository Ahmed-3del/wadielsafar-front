import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import {
  BagIcon,
  BookIcon,
  ClockIcon,
  GlobeIcon,
  MosqueIcon,
  PassportIcon,
} from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import type { VisaPurpose, VisaType } from "@/types/visa";

/*
 * A mark per purpose, so a rail of visas is scannable rather than a row of
 * identical passports. Anything unlabelled keeps the passport, which says
 * "travel document" without claiming to know which kind.
 */
const PURPOSE_ICONS: Record<VisaPurpose, typeof PassportIcon> = {
  TOURISM: GlobeIcon,
  BUSINESS: BagIcon,
  STUDY: BookIcon,
  UMRAH: MosqueIcon,
  OTHER: PassportIcon,
  "": PassportIcon,
};

/*
 * A visa card must answer the four questions a traveller actually has —
 * which visa, how much, how long, how do I start — without a second click.
 * Direct KSA hides price and processing time behind the country page; that is
 * the gap this closes.
 *
 * The picture is the country's, set once and shared by every visa it issues,
 * unless this particular visa carries its own — an Umrah visa wants Makkah
 * rather than a skyline. Neither is required: MediaImage draws a brand block
 * where there is no artwork yet, so an unillustrated card still holds its
 * shape.
 */
export function VisaCard({ visa, className }: { visa: VisaType; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Visas");
  const isArabic = locale === "ar";
  const country = isArabic ? visa.country.name_ar : visa.country.name_en;
  const name = isArabic ? visa.name_ar : visa.name_en;
  const Icon = PURPOSE_ICONS[visa.purpose] ?? PassportIcon;
  const cover = visa.cover_image || visa.country.cover_image;

  return (
    <article
      className={cn(
        "card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <MediaImage
          src={cover}
          alt={country}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 80vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
        />
        {/* The country reads off the picture, so it needs its own ground —
            a caption over open photography is legible until the day someone
            uploads a pale sky. */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-900/85 to-transparent p-4 pt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            {country}
          </p>
        </div>
        <span className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-navy-800 shadow-sm backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-5">
        <h3 className="text-lg font-bold leading-snug text-navy-900">
          {/* Stretched link: the whole card is the target, but only the visa
              name is announced. The apply button below sits above it. */}
          <Link href={`/visas/${visa.id}`} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>

        <dl className="mb-5 mt-4 grid grid-cols-2 gap-4 border-y border-sand-200 py-4">
          <div>
            <dt className="text-xs text-sand-500">{t("price")}</dt>
            <dd className="mt-0.5 text-lg font-bold text-navy-900">
              {formatPrice(visa.price, locale)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-sand-500">
              <ClockIcon className="h-3.5 w-3.5" />
              {t("processingLabel")}
            </dt>
            {/* Working days here and only here: an embassy counts its own
                opening hours, but the visa itself is valid over calendar days. */}
            <dd className="mt-0.5 text-lg font-bold text-navy-900">
              {t("workingDays", { days: visa.processing_time_days })}
            </dd>
          </div>
          {visa.validity_days ? (
            <div className="border-t border-sand-200 pt-3">
              <dt className="text-xs text-sand-500">{t("validityLabel")}</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">
                {t("days", { days: visa.validity_days })}
              </dd>
            </div>
          ) : null}
          {/* Shown only when the record says so. Guessing "single entry" is how
              someone books a side trip they are not allowed to take. */}
          {visa.entry_type ? (
            <div className="border-t border-sand-200 pt-3">
              <dt className="text-xs text-sand-500">{t("entryLabel")}</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">
                {t(`entry.${visa.entry_type}`)}
              </dd>
            </div>
          ) : null}
        </dl>

        <Link
          href={`/visas/${visa.id}`}
          className={cn(buttonVariants("primary", "md"), "relative mt-auto w-full")}
        >
          {t("apply")}
        </Link>
      </div>
    </article>
  );
}
