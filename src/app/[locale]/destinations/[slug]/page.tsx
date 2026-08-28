import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { PackageCard } from "@/components/packages/PackageCard";
import { getDestinationBySlug } from "@/lib/api/destinations";
import { getPackages } from "@/lib/api/packages";
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
  const packages = await safeResults(getPackages({ destination: slug }));

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
            <Link href="/contact" className={buttonVariants("primary", "lg")}>
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

      <Section>
        <Container>
          <SectionHeading title={t("packagesIn", { destination: name })} />
          {packages.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <Reveal key={pkg.id} delay={Math.min(index, 5) * 60}>
                  <PackageCard pkg={pkg} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title={tPackages("empty")}
              description={t("noPackagesBody")}
              className="mt-8"
              action={
                <Link href="/contact" className={buttonVariants("primary", "md")}>
                  {tPackages("requestTrip")}
                </Link>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}
