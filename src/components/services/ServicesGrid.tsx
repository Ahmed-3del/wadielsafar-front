import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { Rail } from "@/components/ui/Rail";
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

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        {/* Swipe on a phone, arrows on a desktop — the Rail is where that
            behaviour already lives, and eight tiles is exactly the case it was
            built for. */}
        <Rail label={t("title")} className="mt-8 gap-3 sm:gap-4">
          {rows.map((service) => {
            const Icon = ICONS[service.icon] ?? TicketIcon;
            const description = isArabic ? service.description_ar : service.description_en;
            const name = isArabic ? service.name_ar : service.name_en;
            return (
              <Link
                key={service.slug}
                // Where the panel points it. Most of these are arranged by an
                // agent, so the contact form is the default — but a tile with
                // a page of its own should lead there.
                //
                // The tile's own service and name travel with it, so a reader
                // who pressed "Travel insurance" lands on a form that already
                // says so rather than one asking what they came for.
                href={service.link || contactHref({ service: service.service_type, topic: name })}
                className="group flex w-52 shrink-0 snap-start flex-col items-center gap-3 overflow-hidden rounded-2xl border border-sand-200 bg-white p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold-500 hover:shadow-lg sm:w-56 sm:p-5"
              >
                {/* An uploaded picture where there is one, the icon where
                    there is not. Both are panel decisions, and the tiles
                    stretch to the tallest in the row, so a mixed row still
                    lines up. */}
                {service.image ? (
                  <span className="relative -mx-4 -mt-4 mb-1 aspect-video w-[calc(100%+2rem)] overflow-hidden rounded-t-2xl sm:-mx-5 sm:-mt-5 sm:w-[calc(100%+2.5rem)]">
                    <MediaImage
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 224px, 208px"
                      className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
                    />
                  </span>
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-navy-900 text-gold-400 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-7 w-7" />
                  </span>
                )}
                <span className="text-sm font-bold leading-5 text-navy-900">
                  {name}
                </span>
                {/* The line an editor writes in the panel, which the tiles
                    used to drop on the floor. Clamped so one long answer
                    cannot make its tile twice the height of its neighbours. */}
                {description ? (
                  <span className="line-clamp-3 text-xs leading-5 text-sand-600">
                    {description}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </Rail>
      </Container>
    </Section>
  );
}
