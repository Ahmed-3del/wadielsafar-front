import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, hero] = await Promise.all([
    getTranslations("AboutPage"),
    getPageHero("about").catch(() => null),
  ]);

  return (
    <>
      <PageHeader hero={hero} isArabic={locale === "ar"} title={t("title")} />

      <Section>
        <Container className="max-w-3xl">
          <p className="text-lg leading-8 text-sand-600">{t("description")}</p>
        </Container>
      </Section>
    </>
  );
}
