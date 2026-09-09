import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/Button";
import { PackageCard } from "@/components/packages/PackageCard";
import { getPackages } from "@/lib/api/packages";
import { budgetBandFor } from "@/features/package-discovery";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

/** Query strings are user input; a non-numeric budget must drop out rather
 *  than reach the API as NaN. */
function toNumber(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

interface PackagesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ destination?: string; price_max?: string; depart?: string }>;
}

export async function generateMetadata({ params }: PackagesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PackagesPage" });
  return { title: t("title"), description: t("description") };
}

export default async function PackagesPage({ params, searchParams }: PackagesPageProps) {
  const { locale } = await params;
  const { destination, price_max: priceMax, depart } = await searchParams;
  setRequestLocale(locale);

  const [t, tPackages, packages, hero] = await Promise.all([
    getTranslations("PackagesPage"),
    getTranslations("Packages"),
    safeResults(getPackages({ destination, price_max: toNumber(priceMax) })),
    getPageHero("packages").catch(() => null),
  ]);

  const planParams = new URLSearchParams();
  if (destination) planParams.set("destination", destination);
  // Packages carry no dates of their own, so a departure date from the widget
  // has nowhere to filter — but the planner asks for exactly this, so it goes
  // there rather than being dropped on the floor.
  if (depart) planParams.set("travel_date", depart);
  if (priceMax) planParams.set("budget", budgetBandFor(Number(priceMax)));
  const planQuery = planParams.toString();
  const planHref = `/packages/plan${planQuery ? `?${planQuery}` : ""}`;

  const isFiltered = Boolean(destination ?? priceMax);

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      >
        {/* The planner inherits the search, so a traveller who filtered and
            found nothing does not re-enter what they just chose. */}
        <Link href={planHref} className={buttonVariants("primary", "lg")}>
          {tPackages("planCta")}
        </Link>
      </PageHeader>

      <Section>
        <Container>
          {isFiltered ? (
            <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sand-600">
              {t("filtered")}
              <Link href="/packages" className="font-semibold text-gold-700 hover:text-gold-800">
                {t("clearFilters")}
              </Link>
            </p>
          ) : null}
          {packages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <p className="text-sand-500">{tPackages("empty")}</p>
          )}
        </Container>
      </Section>
    </>
  );
}
