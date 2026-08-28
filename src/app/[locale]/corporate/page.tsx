import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { HowItWorks } from "@/components/services/HowItWorks";
import { FinalCta } from "@/components/layout/FinalCta";
import { buttonVariants } from "@/components/ui/Button";
import { PassportIcon, PlaneIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface CorporatePageProps {
  params: Promise<{ locale: Locale }>;
}

const SERVICES = [
  { key: "teams", Icon: PlaneIcon },
  { key: "delegations", Icon: UsersIcon },
  { key: "visas", Icon: PassportIcon },
  { key: "billing", Icon: ShieldIcon },
] as const;

export async function generateMetadata({ params }: CorporatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CorporatePage" });
  return { title: t("title"), description: t("description") };
}

export default async function CorporatePage({ params }: CorporatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tForm, hero] = await Promise.all([
    getTranslations("CorporatePage"),
    getTranslations("InquiryForm"),
    getPageHero("corporate").catch(() => null),
  ]);

  const steps = (["talk", "account", "book"] as const).map((id) => ({
    id,
    title: t(`how.steps.${id}.title`),
    body: t(`how.steps.${id}.body`),
  }));

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      >
        <Link href="/contact" className={buttonVariants("primary", "lg")}>
          {tForm("title")}
        </Link>
      </PageHeader>

      <Section>
        <Container>
          <SectionHeading title={t("servicesTitle")} description={t("servicesDescription")} />
          <FeatureGrid
            className="mt-10 lg:grid-cols-2"
            items={SERVICES.map(({ key, Icon }) => ({
              id: key,
              title: t(`services.${key}.title`),
              body: t(`services.${key}.body`),
              Icon,
            }))}
          />
        </Container>
      </Section>

      <HowItWorks title={t("how.title")} description={t("how.description")} steps={steps} />
      <FinalCta />
    </>
  );
}
