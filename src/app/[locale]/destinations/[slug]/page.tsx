import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { contactHref } from "@/lib/utils/contact-link";
import { PackageCard } from "@/components/packages/PackageCard";
import { HotelCard } from "@/components/hotels/HotelCard";
import { CruiseCard } from "@/components/cruises/CruiseCard";
import { ScrollGrid } from "@/components/ui/ScrollGrid";
import { getDestinationBySlug } from "@/lib/api/destinations";
import { getPackages } from "@/lib/api/packages";
import { getHotels } from "@/lib/api/hotels";
import { getCruises } from "@/lib/api/cruises";
import { safeResults } from "@/lib/api/client";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface DestinationDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function fetchDestination(slug: string) {
  return fetchDetail(getDestinationBySlug(slug));
}

export async function generateMetadata({
  params,
}: DestinationDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const destination = await fetchDestination(slug);
  if (!destination) return {};

  const isArabic = locale === "ar";
  return {
    title: isArabic ? destination.name_ar : destination.name_en,
    description: isArabic ? destination.description_ar : destination.description_en,
  };
}

export default async function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tPackages, tWa, destination] = await Promise.all([
    getTranslations("DestinationsPage"),
    getTranslations("Packages"),
    getTranslations("Whatsapp"),
    fetchDestination(slug),
  ]);
  if (!destination) notFound();

  const isArabic = locale === "ar";
  const name = isArabic ? destination.name_ar : destination.name_en;
  const description = isArabic ? destination.description_ar : destination.description_en;
  /*
   * Everything this destination can be booked as. The page used to answer only
   * "which packages go here", which left a city with no ready-made package
   * looking like a place we do not sell — while its hotels sat one click away
   * on another page.
   */
  const [packages, hotels, cruises] = await Promise.all([
    safeResults(getPackages({ destination: slug })),
    safeResults(getHotels({ destination: slug })),
    safeResults(getCruises({ destination: slug })),
  ]);
  const hasAnything = packages.length + hotels.length + cruises.length > 0;

  return (
    <>
      <section className="relative min-h-96 overflow-hidden bg-navy-900">
        <MediaImage
          src={destination.cover_image}
          alt={name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/50 to-navy-950/20"
        />
        <Container className="relative flex min-h-96 flex-col justify-end py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {isArabic ? destination.country_ar : destination.country_en}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">{name}</h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-navy-100">{description}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={contactHref({ service: "PACKAGE", topic: name })}
              className={buttonVariants("primary", "lg")}
            >
              {t("planTrip")}
            </Link>
            <a
              href={whatsappLink(t("whatsappMessage", { destination: name }))}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants("outline", "lg"), "border-white/40 bg-white/10 text-white hover:bg-white/20")}
            >
              <WhatsAppIcon className="h-5 w-5" />
              {tWa("short")}
            </a>
          </div>
        </Container>
      </section>

      {packages.length > 0 ? (
        <Section>
          <Container>
            <SectionHeading title={t("packagesIn", { destination: name })} />
            <ScrollGrid
              label={t("packagesIn", { destination: name })}
              gridClassName="sm:grid-cols-2 lg:grid-cols-3"
              className="mt-6 sm:mt-8"
            >
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </ScrollGrid>
          </Container>
        </Section>
      ) : null}

      {hotels.length > 0 ? (
        <Section className="bg-sand-50">
          <Container>
            <SectionHeading title={t("hotelsIn", { destination: name })} />
            <ScrollGrid
              label={t("hotelsIn", { destination: name })}
              gridClassName="sm:grid-cols-2 lg:grid-cols-3"
              className="mt-6 sm:mt-8"
            >
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </ScrollGrid>
          </Container>
        </Section>
      ) : null}

      {cruises.length > 0 ? (
        <Section>
          <Container>
            <SectionHeading title={t("cruisesIn", { destination: name })} />
            <ScrollGrid
              label={t("cruisesIn", { destination: name })}
              gridClassName="sm:grid-cols-2 lg:grid-cols-3"
              className="mt-6 sm:mt-8"
            >
              {cruises.map((cruise) => (
                <CruiseCard key={cruise.id} cruise={cruise} />
              ))}
            </ScrollGrid>
          </Container>
        </Section>
      ) : null}

      {/* Only when there is genuinely nothing on the shelf for this place —
          which is an invitation to ask, not an apology. */}
      {hasAnything ? null : (
        <Section>
          <Container>
            <EmptyState
              title={tPackages("empty")}
              description={t("noPackagesBody")}
              action={
                <Link
                  href={contactHref({ service: "PACKAGE", topic: name })}
                  className={buttonVariants("primary", "md")}
                >
                  {tPackages("requestTrip")}
                </Link>
              }
            />
          </Container>
        </Section>
      )}
    </>
  );
}
