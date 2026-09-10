import Image from "next/image";
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
 * "travel document" without claiming to know which kind. Doubles as the flag
 * badge's own fallback below, so a country with no flag on file still gets a
 * mark that means something rather than a blank circle.
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
 * Two pictures, not one: a photograph of the country behind, and its flag as a
 * circular badge stamped over the seam where the photo meets the card body —
 * the same "passport stamp" pairing most visa cards on the web reach for,
 * because it answers "which country" twice, at a glance, before a word is
 * read. The photo is the country's, set once and shared by every visa it
 * issues, unless this particular visa carries its own — an Umrah visa wants
 * Makkah rather than a skyline. Neither picture is required: a country with no
 * photo on file still gets its flag over a brand-coloured field, and one with
 * no flag on file falls back to the purpose mark instead — a visa card always
 * has a badge, never a blank circle.
 */
export function VisaCard({ visa, className }: { visa: VisaType; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Visas");
  const isArabic = locale === "ar";
  const country = isArabic ? visa.country.name_ar : visa.country.name_en;
  const name = isArabic ? visa.name_ar : visa.name_en;
  const Icon = PURPOSE_ICONS[visa.purpose] ?? PassportIcon;
  const cover = visa.cover_image || visa.country.cover_image;
  const flag = visa.country.flag_image;

  return (
    <article
      className={cn(
        // `relative` matters here, not just decoratively: the visa name's
        // stretched link below sizes its click-target pseudo-element against
        // the nearest positioned ancestor, and without one on the card itself
        // it reached past this card entirely, onto whatever positioned box it
        // found further up the tree — which is how clicking one visa card
        // opened its neighbour's instead.
        "card-lift group relative flex h-full flex-col rounded-2xl border border-sand-200 bg-white",
        className,
      )}
    >
      {/* Its own positioning context, separate from the card's own — the
          badge below straddles this box's bottom edge by exactly half its own
          height, which only lines up if nothing else here changes this box's
          height. The text underneath does not belong to it. */}
      <div className="relative">
        {/* An aspect ratio rather than a fixed height, so the photo keeps its
            own proportions as the card's width changes across a rail's fixed
            breakpoints and a listing grid's fluid columns alike — a fixed
            height either cropped tighter than intended on a wide card or ran
            taller than the rest of the row on a narrow one. 4:3 is short
            enough that this stays a compact card, tall enough that the photo
            reads as a place rather than a strip of colour. Rounded on its own
            top corners rather than relying on the card's overflow-hidden to
            do it — the card is no longer clipping, on purpose, so the badge
            below is not cut off along with whatever else would have been. */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-2xl">
          <MediaImage
            src={cover}
            alt={country}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 72vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
          />
          {/* Fades the foot of the photo toward the card's own white, so the
              badge's ring sits on a soft edge whatever colour the photo ends
              on, rather than a hard seam. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-white to-transparent"
          />
        </div>

        {/* Stamped over the seam: `bottom-0` puts this box's own bottom edge
            exactly on the photo's, and translating it down by half its height
            centres the badge on that line — half over the photo, half over
            the card body, wherever the card's own height ends up. */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-sand-100 shadow-md">
            {flag ? (
              <Image
                src={flag}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon className="h-6 w-6 text-navy-700" />
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">{country}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-navy-900">
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
        <dl className="mt-2 grid w-full grid-cols-2 gap-x-2 gap-y-1 border-t border-sand-200 pt-2 text-start text-xs">
          <div className="flex flex-wrap items-baseline gap-x-1">
            <dt className="text-sand-500">{t("price")}</dt>
            <dd className="font-bold text-navy-900">{formatPrice(visa.price, locale)}</dd>
          </div>
          {/* No clock icon here, unlike an earlier pass at this card: at a
              rail card's width the icon was the difference between the value
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
