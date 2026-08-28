import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import {
  BedIcon,
  ChevronForwardIcon,
  GlobeIcon,
  PassportIcon,
  PlaneIcon,
  ShipIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { FALLBACK_SERVICES, type ServiceLinkKey } from "@/lib/constants/services";

const ICONS: Record<ServiceLinkKey, typeof PlaneIcon> = {
  flights: PlaneIcon,
  hotels: BedIcon,
  packages: GlobeIcon,
  visas: PassportIcon,
  cruises: ShipIcon,
  corporate: UsersIcon,
};

/*
 * The homepage's primary route into each service line. It reads from the
 * static service list rather than the API on purpose: this grid is navigation,
 * and navigation must not disappear because a content fetch failed.
 */
export async function ServicesGrid() {
  const t = await getTranslations("Services");

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {FALLBACK_SERVICES.map((service, index) => {
            const Icon = ICONS[service.key];
            return (
              <Reveal key={service.key} delay={index * 60}>
                <Link
                  href={service.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
                >
                  {/* Gold wash that only appears on hover, so the resting state
                      stays calm and the hover state clearly reads as a target. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-br from-gold-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-400 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold text-navy-900">
                    {t(`${service.key}.title`)}
                  </h3>
                  <p className="relative mt-2 flex-1 text-sm leading-6 text-sand-600">
                    {t(`${service.key}.description`)}
                  </p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    {t("more")}
                    <ChevronForwardIcon className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
