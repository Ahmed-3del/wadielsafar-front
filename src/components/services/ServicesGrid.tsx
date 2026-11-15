import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import {
  BagIcon,
  BedIcon,
  BookIcon,
  CalendarIcon,
  CarIcon,
  ClockIcon,
  GiftIcon,
  GlobeIcon,
  HeadsetIcon,
  LicenceIcon,
  MapIcon,
  MealIcon,
  MosqueIcon,
  PassportIcon,
  PinIcon,
  PlaneIcon,
  ShieldIcon,
  ShipIcon,
  SimIcon,
  TagIcon,
  TicketIcon,
  TransferIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getServices } from "@/lib/api/services";
import { safeResults } from "@/lib/api/client";
import { contactHref } from "@/lib/utils/contact-link";
import { FALLBACK_ADDON_SERVICES } from "@/lib/constants/services";
import type { Service } from "@/types/service";

/*
 * The `icon` column holds a key, not an asset, so the site owns its own marks.
 *
 * Every key in the panel's list is drawn here — the backend's
 * ServiceIconChoices and this map are meant to be changed together. A key with
 * no entry still falls back to the ticket rather than leaving a gap, but that
 * is now a bug rather than the normal case it used to be.
 */
const ICONS: Record<string, typeof CarIcon> = {
  car: CarIcon,
  transfer: TransferIcon,
  licence: LicenceIcon,
  shield: ShieldIcon,
  sim: SimIcon,
  ticket: TicketIcon,
  passport: PassportIcon,
  headset: HeadsetIcon,
  plane: PlaneIcon,
  bed: BedIcon,
  ship: ShipIcon,
  globe: GlobeIcon,
  bag: BagIcon,
  map: MapIcon,
  pin: PinIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  users: UsersIcon,
  meal: MealIcon,
  tag: TagIcon,
  gift: GiftIcon,
  book: BookIcon,
  mosque: MosqueIcon,
};

/*
 * "Everything you need for your trip" — the add-ons, as one swipeable row.
 *
 * Deliberately not flights/hotels/packages/visas/cruises: those five are the
 * search tabs at the top of the page, and repeating them here as cards was the
 * duplication the client's feedback asked us to remove. What is left is what a
 * traveller adds once the trip itself is settled.
 *
 * One row that scrolls, not a grid that stacks: eight tiles in a column is two
 * screens of phone, and these are things to glance across rather than read.
 */
export async function ServicesGrid() {
  const [t, locale, services] = await Promise.all([
    getTranslations("Services"),
    getLocale(),
    safeResults(getServices({ page_size: 20 })),
  ]);

  const isArabic = locale === "ar";
  // Navigation-ish content, so it must not vanish because a fetch failed.
  const rows: Service[] = services.length > 0 ? services : FALLBACK_ADDON_SERVICES;

  /*
   * A slim strip of icon tiles, not a section of cards. It sits directly under
   * the search now (see page.tsx), ahead of everything else, so it has to
   * be small: a row of marks with a label each — the way a booking app lays
   * out its extras — rather than tiles with a picture and a paragraph. The
   * description travels as the tile's tooltip, so nothing an editor writes is
   * thrown away.
   */
  return (
    <Section className="border-sand-200 border-b py-4 sm:py-5 lg:py-5">
      <Container>
        {/* No visible title and no arrows, as the client asked — the marks
            speak for themselves. Centred on the page from sm up (they wrap if
            the row runs out of room); on a phone the row swipes sideways. */}
        <h2 className="sr-only">{t("eyebrow")}</h2>

        <div
          role="region"
          aria-label={t("title")}
          tabIndex={0}
          className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0"
        >
          {rows.map((service) => {
            const Icon = ICONS[service.icon] ?? TicketIcon;
            const description = isArabic ? service.description_ar : service.description_en;
            const name = isArabic ? service.name_ar : service.name_en;
            return (
              <Link
                key={service.slug}
                // Where the panel points it — the contact form by default,
                // carrying the tile's slug so the form opens already set to
                // this service, unless the tile has a page of its own.
                href={service.link || contactHref({ service: service.slug })}
                title={description || undefined}
                className="group hover:bg-sand-50 flex w-20 shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl p-1.5 text-center transition-colors sm:w-28"
              >
                {service.image ? (
                  <span className="ring-sand-200 relative h-11 w-11 overflow-hidden rounded-full ring-1 lg:h-10 lg:w-10">
                    <MediaImage
                      src={service.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="bg-navy-900 text-gold-400 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105 lg:h-10 lg:w-10">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <span className="text-navy-900 line-clamp-2 text-[11px] leading-4 font-semibold sm:text-xs">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
