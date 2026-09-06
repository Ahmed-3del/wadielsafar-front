import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLinkIcon, MapIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { mapEmbedSrc, mapSearchUrl, usesGoogleEmbed } from "@/lib/utils/maps";
import { cn } from "@/lib/utils/cn";
import type { Branch } from "@/types/company";

/*
 * One branch: where it is, what it looks like on a map, and the two things
 * anyone actually does next — ring it, or navigate to it.
 *
 * The map is a preview, not a widget: pointer events are off, so a thumb
 * dragging down the page is never caught by an embedded map, and the explicit
 * "view on map" link is what opens the real thing.
 */
export async function BranchCard({ branch }: { branch: Branch }) {
  const [t, locale] = await Promise.all([getTranslations("Branches"), getLocale()]);
  const isArabic = locale === "ar";

  const name = isArabic ? branch.name_ar : branch.name_en;
  const address = isArabic ? branch.address_ar : branch.address_en;
  const phoneDisplay = branch.phone_display || branch.phone;
  const mapUrl = mapSearchUrl(branch.latitude, branch.longitude, address);
  // Kept as a pair so the embed never has to assert one of them away.
  const pin =
    branch.latitude && branch.longitude
      ? { lat: branch.latitude, lng: branch.longitude }
      : null;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md",
        // The head office is marked by the card itself, not only by a word in
        // the title: four near-identical cards is exactly where a reader
        // stops reading titles.
        branch.is_main
          ? "border-gold-500 ring-2 ring-gold-500/20"
          : "border-sand-200",
      )}
    >
      <div className="relative h-36 overflow-hidden bg-sand-100">
        {pin ? (
          <>
            <iframe
              src={mapEmbedSrc(pin.lat, pin.lng, locale)}
              title={t("mapTitle", { branch: name })}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={cn(
                // Pointer events off so a thumb scrolling the page is never
                // caught by the map; the overlay below takes the taps.
                "pointer-events-none absolute inset-x-0 w-full border-0",
                // OpenStreetMap prints a link bar across the foot of its
                // embed, which lands on top of the card. The frame is drawn
                // taller than its box so that bar falls outside, and the
                // credit it carries is reprinted below — cropping the bar
                // without restoring the credit would drop the attribution
                // the licence requires. Google's own embed carries its logo
                // in the same place, so that one is never cropped.
                // The frame is drawn 160px taller and pulled up by half of
                // that, so the crop takes 80px off the foot — enough for the
                // bar even when it wraps to three lines in a narrow card —
                // while the pin stays centred in what is left.
                usesGoogleEmbed ? "top-0 h-full" : "-top-20 h-[calc(100%+10rem)]",
              )}
            />

            {/* The whole map opens the real one. Without this the embed is a
                picture with dead zoom buttons painted on it. */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("viewOnMapNamed", { branch: name })}
              className="absolute inset-0"
            />

            {usesGoogleEmbed ? null : (
              <span className="pointer-events-none absolute bottom-1 end-1 rounded bg-white/85 px-1.5 py-0.5 text-[9px] leading-4 text-sand-600">
                © OpenStreetMap
              </span>
            )}
          </>
        ) : (
          /* No pin on the record yet. A labelled placeholder is honest; a map
             centred on a guess is not. */
          <div className="grid h-full place-items-center text-sand-400">
            <MapIcon className="h-8 w-8" />
          </div>
        )}

        {branch.is_main ? (
          <span className="absolute start-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-navy-900 shadow-sm">
            {t("mainBadge")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-bold text-navy-900">{name}</h3>

        {address ? (
          <p className="flex items-start gap-2 text-sm leading-6 text-sand-600">
            <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            {address}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <a
            href={`tel:${branch.phone}`}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 px-3.5 py-2 text-sm font-bold text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-100"
          >
            <PhoneIcon className="h-4 w-4 text-gold-700" />
            <span dir="ltr">{phoneDisplay}</span>
          </a>

          {/* New tab, because leaving the site to open a map should not cost
              the reader the page they were on. */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 px-3.5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-300 hover:bg-sand-50"
          >
            {t("viewOnMap")}
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
