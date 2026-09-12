import { getLocale, getTranslations } from "next-intl/server";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { mapSearchUrl } from "@/lib/utils/maps";
import { cn } from "@/lib/utils/cn";
import type { Branch } from "@/types/company";

/*
 * One branch, as a row: its own photo where one has been added, what it
 * needs to say, and the two things anyone actually does next — ring it, or
 * navigate to it. The map itself lives once, big, beside the whole list —
 * see BranchesSection — rather than repeated in miniature on every row,
 * where a live map this small would show roads and labels nobody can read.
 */
export async function BranchCard({ branch }: { branch: Branch }) {
  const [t, locale] = await Promise.all([getTranslations("Branches"), getLocale()]);
  const isArabic = locale === "ar";

  const name = isArabic ? branch.name_ar : branch.name_en;
  const address = isArabic ? branch.address_ar : branch.address_en;
  const hours = isArabic ? branch.working_hours_ar : branch.working_hours_en;
  const phoneDisplay = branch.phone_display || branch.phone;
  const mapUrl = mapSearchUrl(name, address, branch.google_maps_url);

  return (
    <article
      className={cn(
        "flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        // The head office is marked by the row itself, not only by a word in
        // the title: four near-identical rows is exactly where a reader
        // stops reading titles.
        branch.is_main ? "border-gold-500 ring-2 ring-gold-500/20" : "border-sand-200",
      )}
    >
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("viewOnMapNamed", { branch: name })}
        className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-gold-50 sm:h-28 sm:w-28"
      >
        {branch.cover_image ? (
          <MediaImage
            src={branch.cover_image}
            alt={name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          /* No photo on the record yet. A mark in the brand's own colour is
             honest about that; a stretched, blurry map tile is not. */
          <PinIcon className="h-8 w-8 text-gold-500" />
        )}
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-navy-900">{name}</h3>
          {branch.is_main ? (
            <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[11px] font-bold text-navy-900">
              {t("mainBadge")}
            </span>
          ) : null}
        </div>

        {address ? (
          <p className="flex items-start gap-1.5 text-sm leading-6 text-sand-600">
            <PinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            <span className="line-clamp-2">{address}</span>
          </p>
        ) : null}

        {/* The label and the hours are two different colours on purpose —
            "Hours" is a constant every row repeats, and the actual times are
            the one fact that changes row to row, so the two need to read as
            different kinds of text rather than one run-on sentence. */}
        {hours ? (
          <p className="flex items-start gap-1.5 text-sm leading-6">
            <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            <span>
              <span className="font-semibold text-gold-700">{t("hoursLabel")}</span>{" "}
              <span className="text-navy-800">{hours}</span>
            </span>
          </p>
        ) : null}

        <a
          href={`tel:${branch.phone}`}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 px-3 py-1.5 text-sm font-bold text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-100"
        >
          <PhoneIcon className="h-3.5 w-3.5 text-gold-700" />
          <span dir="ltr">{phoneDisplay}</span>
        </a>
      </div>
    </article>
  );
}
