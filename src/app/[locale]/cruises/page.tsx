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
import { getCruises } from "@/lib/api/cruises";
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
  searchParams: Promise<{ destination?: string; search?: string; depart?: string }>;
}

export async function generateMetadata({ params }: CruisesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CruisesPage" });
  return { title: t("title"), description: t("description") };
}

export default async function CruisesPage({ params, searchParams }: CruisesPageProps) {
  const { locale } = await params;
  const { destination, search, depart } = await searchParams;
  setRequestLocale(locale);

  const [t, tCruises, cruises, hero] = await Promise.all([
    getTranslations("CruisesPage"),
    getTranslations("Cruises"),
    safeResults(getCruises({ destination, search, depart_after: isIsoDate(depart) })),
    getPageHero("cruises").catch(() => null),
  ]);

  const isFiltered = Boolean(destination ?? search ?? isIsoDate(depart));

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      />
      <Section>
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
