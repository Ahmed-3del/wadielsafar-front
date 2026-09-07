import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { buttonVariants } from "@/components/ui/Button";
import { contactHref } from "@/lib/utils/contact-link";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { getDestinations } from "@/lib/api/destinations";
import { safeResults } from "@/lib/api/client";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface DestinationsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: DestinationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DestinationsPage" });
  return { title: t("title"), description: t("description") };
}

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCommon, destinations, hero] = await Promise.all([
    getTranslations("DestinationsPage"),
    getTranslations("Common2"),
    safeResults(getDestinations({ page_size: 60 })),
    getPageHero("destinations").catch(() => null),
  ]);

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("title")} description={t("description")} />
      <Section>
        <Container>
          {destinations.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {destinations.map((destination, index) => (
                <Reveal key={destination.id} delay={Math.min(index, 6) * 60}>
                  <DestinationCard destination={destination} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("empty")}
              description={t("emptyBody")}
              action={
                <Link href={contactHref({ service: "PACKAGE" })} className={buttonVariants("primary", "md")}>
                  {tCommon("bookNow")}
                </Link>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}
