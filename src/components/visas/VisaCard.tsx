import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { BagIcon, BookIcon, GlobeIcon, MosqueIcon, PassportIcon } from "@/components/ui/icons";
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
      {/* A fixed h-32 rather than the aspect-video this used to be. Package
          and cruise photos are what sells the trip; a visa's picture is
          branding on top of a decision the stats below actually carry, so it
          does not need the same headroom — and at aspect-video it was over
          half the card's height on its own. */}
      <div className="relative h-32 overflow-hidden">
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
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-900/85 to-transparent p-3 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            {country}
          </p>
        </div>
        <span className="absolute end-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-navy-800 shadow-sm backdrop-blur-sm">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-navy-900">
          {/* Stretched link: the whole card is the target, but only the visa
              name is announced. The apply button below sits above it. */}
          <Link href={`/visas/${visa.id}`} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>

        {/* Still all four facts a traveller asks — price, processing,
            validity, entry type — just label and value on one line each
            instead of stacked in a bordered box per fact. Two stacked lines
            per cell was most of this card's height for information a phone
            reads fine as one. */}
        <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-sand-200 pt-2 text-xs">
          <div className="flex flex-wrap items-baseline gap-x-1">
            <dt className="text-sand-500">{t("price")}</dt>
            <dd className="font-bold text-navy-900">{formatPrice(visa.price, locale)}</dd>
          </div>
          {/* No clock icon here, unlike the old stacked layout: at a rail
              card's width the icon was the difference between the value
              fitting and "10 أيام عم…" — a cut-off number reads as broken in
              a way a wrapped line never does, so wrapping is the fallback now
              rather than a truncated ellipsis. */}
          <div className="flex flex-wrap items-baseline gap-x-1">
            <dt className="text-sand-500">{t("processingLabel")}</dt>
            {/* Working days here and only here: an embassy counts its own
                opening hours, but the visa itself is valid over calendar days. */}
            <dd className="font-bold text-navy-900">
              {t("workingDays", { days: visa.processing_time_days })}
            </dd>
          </div>
          {visa.validity_days ? (
            <div className="flex flex-wrap items-baseline gap-x-1">
              <dt className="text-sand-500">{t("validityLabel")}</dt>
              <dd className="font-semibold text-navy-900">
                {t("days", { days: visa.validity_days })}
              </dd>
            </div>
          ) : null}
          {/* Shown only when the record says so. Guessing "single entry" is how
              someone books a side trip they are not allowed to take. */}
          {visa.entry_type ? (
            <div className="flex flex-wrap items-baseline gap-x-1">
              <dt className="text-sand-500">{t("entryLabel")}</dt>
              <dd className="font-semibold text-navy-900">{t(`entry.${visa.entry_type}`)}</dd>
            </div>
          ) : null}
        </dl>

        <Link
          href={`/visas/${visa.id}`}
          className={cn(buttonVariants("primary", "sm"), "relative mt-2.5 w-full")}
        >
          {t("apply")}
        </Link>
      </div>
    </article>
  );
}
