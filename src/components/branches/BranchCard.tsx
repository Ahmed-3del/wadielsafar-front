import { getLocale, getTranslations } from "next-intl/server";
import { ClockIcon, MapIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
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
  const hours = isArabic ? branch.working_hours_ar : branch.working_hours_en;
  const phoneDisplay = branch.phone_display || branch.phone;
  const mapUrl = mapSearchUrl(name, address, branch.google_maps_url);
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

            {/* OSM's own embed carries a marker param, but its pin is a fixed
                green it does not let a caller recolour — see mapEmbedSrc,
                which asks for the bare tiles instead. This is drawn over
                them, in the site's own colour, pointing at the same spot
                Google's place marker already sits on when that path is used
                instead. */}
            {usesGoogleEmbed ? null : (
              <PinIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-full fill-red-600 text-red-700 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
              />
            )}

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

        {/* The label and the hours are two different colours on purpose —
            "Hours" is a constant every card repeats, and the actual times are
            the one fact that changes card to card, so the two need to read
            as different kinds of text rather than one run-on sentence. */}
        {hours ? (
          <p className="flex items-start gap-2 text-sm leading-6">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            <span>
              <span className="font-semibold text-gold-700">{t("hoursLabel")}</span>{" "}
              <span className="text-navy-800">{hours}</span>
            </span>
          </p>
        ) : null}

        <a
          href={`tel:${branch.phone}`}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 px-3.5 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-100"
        >
          <PhoneIcon className="h-4 w-4 text-gold-700" />
          <span dir="ltr">{phoneDisplay}</span>
        </a>
      </div>
    </article>
  );
}
