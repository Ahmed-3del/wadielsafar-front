import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { CruiseCard } from "@/components/cruises/CruiseCard";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { CRUISE_FIELDS } from "@/features/requests/fields";
import { getCruisePorts, getCruises } from "@/lib/api/cruises";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

/* Passed straight to a date filter, so anything that is not a plain ISO date
 * has to drop out before it reaches the API. */
function isIsoDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

interface CruisesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    destination?: string;
    search?: string;
    depart?: string;
    /** ISO 3166-1 alpha-2 — the country the homepage's cruise search asked for. */
    country?: string;
    /** A port code from the same search. */
    port?: string;
  }>;
}

export async function generateMetadata({ params }: CruisesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CruisesPage" });
  return { title: t("title"), description: t("description") };
}

export default async function CruisesPage({ params, searchParams }: CruisesPageProps) {
  const { locale } = await params;
  const { destination, search, depart, country, port } = await searchParams;
  setRequestLocale(locale);

  const [t, tCruises, tForm, cruises, ports, hero] = await Promise.all([
    getTranslations("CruisesPage"),
    getTranslations("Cruises"),
    getTranslations("RequestForm"),
    safeResults(
      getCruises({
        destination,
        search,
        depart_after: isIsoDate(depart),
        // A port is inside a country, so sending both narrows to the port —
        // which is what someone who picked both asked for.
        country,
        port,
      }),
    ),
    safeResults(getCruisePorts()),
    getPageHero("cruises").catch(() => null),
  ]);

  /*
   * The homepage sends a port code; the form asks a person for a port. So the
   * code is resolved back to the name that was picked, and anything the
   * catalogue does not know is simply left blank rather than printed raw.
   */
  const chosenPort = ports.find((row) => row.code === port);
  const isArabic = locale === "ar";
  const defaults: Record<string, string> = {};
  if (chosenPort) defaults.departure_port = isArabic ? chosenPort.city_ar : chosenPort.city_en;
  const sailDate = isIsoDate(depart);
  if (sailDate) defaults.sail_date = sailDate;
  const arrivedFromSearch = Boolean(chosenPort ?? country ?? sailDate);

  const isFiltered = Boolean(destination ?? search ?? country ?? port ?? isIsoDate(depart));

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      />
      {/* The request form first, as on the flights and hotels pages. Someone
          who came through the homepage search has already said where they want
          to sail from and when — this is where they finish the sentence, and
          the sailings below are suggestions rather than the answer. */}
      <Section>
        <Container className="max-w-4xl">
          <ServiceRequestForm
            serviceType="CRUISE"
            fields={CRUISE_FIELDS}
            defaults={defaults}
            title={t("formTitle")}
            notice={arrivedFromSearch ? tForm("prefilledNotice") : undefined}
          />
        </Container>
      </Section>

      <Section className="bg-sand-50">
        <Container>
          {isFiltered ? (
            <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sand-600">
              {t("filtered")}
              <Link href="/cruises" className="font-semibold text-gold-700 hover:text-gold-800">
                {t("clearFilters")}
              </Link>
            </p>
          ) : null}
          {cruises.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cruises.map((cruise, index) => (
                <Reveal key={cruise.id} delay={Math.min(index, 5) * 60}>
                  <CruiseCard cruise={cruise} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title={tCruises("empty")}
              description={t("noResultsBody")}
              action={
                <Link href="/contact" className={buttonVariants("primary", "md")}>
                  {tCruises("requestCruise")}
                </Link>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}
