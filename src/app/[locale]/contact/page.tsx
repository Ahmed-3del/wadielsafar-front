import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDestinations } from "@/lib/api/destinations";
import { getInquiryFields } from "@/lib/api/inquiry-fields";
import { getContactFormServices } from "@/lib/api/contact-form-services";
import { asFormChoice } from "@/lib/utils/contact-link";
import { safeResults } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface ContactPageProps {
  params: Promise<{ locale: Locale }>;
  /** `offer`/`promo` when someone arrives by claiming an offer; `service` and
   *  `topic` when they arrive by pressing a service anywhere on the site. */
  searchParams: Promise<{ offer?: string; promo?: string; service?: string; topic?: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  const { offer, promo, service, topic } = await searchParams;
  setRequestLocale(locale);

  const [t, tFooter, destinations, fields, formServices, hero] = await Promise.all([
    getTranslations("ContactPage"),
    getTranslations("Footer"),
    safeResults(getDestinations({ page_size: 100 })),
    // What to ask once a service is chosen. An unreachable API leaves the
    // fixed half of the form, which still reaches an agent.
    safeResults(getInquiryFields()),
    // What to offer in the first place: the base types and the services
    // switched on for the form, merged and ordered by the API. The form has
    // its own fallback for the six an enquiry can be filed under.
    getContactFormServices().catch(() => []),
    getPageHero("contact").catch(() => null),
  ]);

  /*
   * Trimmed and length-capped: these arrive in a URL anyone can edit, and they
   * are shown on the page and filed on the enquiry.
   */
  const claim =
    offer || promo
      ? {
          offer: (offer ?? "").trim().slice(0, 120),
          code: (promo ?? "").trim().slice(0, 30),
        }
      : null;

  // Checked against what is actually on offer rather than trusted: an entry
  // the panel switched off must not come back through a hand-edited URL.
  const initialChoice = asFormChoice(service, formServices);
  const requestedTopic = topic ? topic.trim().slice(0, 120) : null;

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
            <InquiryForm
              destinations={destinations}
              fields={fields}
              services={formServices}
              initialChoice={initialChoice}
              topic={requestedTopic}
              claim={claim}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
