import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDestinations } from "@/lib/api/destinations";
import { getInquiryFields } from "@/lib/api/inquiry-fields";
import { safeResults } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface ContactPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tFooter, destinations, fields, hero] = await Promise.all([
    getTranslations("ContactPage"),
    getTranslations("Footer"),
    safeResults(getDestinations({ page_size: 100 })),
    // What to ask once a service is chosen. An unreachable API leaves the
    // fixed half of the form, which still reaches an agent.
    safeResults(getInquiryFields()),
    getPageHero("contact").catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        hero={hero}
        isArabic={locale === "ar"}
        title={t("title")}
        description={t("description")}
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <dl className="space-y-2 text-sm text-sand-600">
              <div>
                <dt className="inline font-semibold text-navy-900">{tFooter("phone")}: </dt>
                <dd className="inline">{siteConfig.contactPhone}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-navy-900">{tFooter("email")}: </dt>
                <dd className="inline">{siteConfig.contactEmail}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-sand-200 p-6 sm:p-8">
            <InquiryForm destinations={destinations} fields={fields} />
          </div>
        </Container>
      </Section>
    </>
  );
}
