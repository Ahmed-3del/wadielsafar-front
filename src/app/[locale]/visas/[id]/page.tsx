import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { buttonVariants } from "@/components/ui/Button";
import { CheckIcon, ClockIcon, PassportIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getVisaTypeById } from "@/lib/api/visas";
import { formatPrice } from "@/lib/utils/format-date";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import { fetchDetail } from "@/lib/api/fetch-detail";
import { getPageHero } from "@/lib/api/page-heroes";
import type { Locale } from "@/i18n/routing";

interface VisaDetailPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

async function fetchVisaType(id: string) {
  return fetchDetail(getVisaTypeById(id));
}

export async function generateMetadata({ params }: VisaDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const visa = await fetchVisaType(id);
  if (!visa) return {};

  const isArabic = locale === "ar";
  return {
    title: `${isArabic ? visa.name_ar : visa.name_en} — ${
      isArabic ? visa.country.name_ar : visa.country.name_en
    }`,
  };
}

export default async function VisaDetailPage({ params }: VisaDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, tVisas, tWa, visa, hero] = await Promise.all([
    getTranslations("VisaDetailPage"),
    getTranslations("Visas"),
    getTranslations("Whatsapp"),
    fetchVisaType(id),
    getPageHero("visas").catch(() => null),
  ]);
  if (!visa) notFound();

  const isArabic = locale === "ar";
  const name = isArabic ? visa.name_ar : visa.name_en;
  const country = isArabic ? visa.country.name_ar : visa.country.name_en;
  const requirements = isArabic ? visa.requirements_ar : visa.requirements_en;

  // Requirements are authored as free text; split them into a checklist so they
  // can be scanned rather than read as a paragraph.
  const requirementItems = requirements
    .split(/\r?\n|،(?=\s)/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  const faqKeys = ["q1", "q2", "q3"] as const;

  return (
    <>
      <PageHeader hero={hero} isArabic={isArabic} title={name} description={country} />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <h2 className="text-xl font-bold text-navy-900">{t("requirementsTitle")}</h2>
              {requirementItems.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {requirementItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span className="text-base leading-7 text-sand-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sand-600">{t("noRequirements")}</p>
              )}

              <h2 className="mt-12 text-xl font-bold text-navy-900">{t("faqTitle")}</h2>
              <Accordion
                className="mt-5"
                items={faqKeys.map((key) => ({
                  id: key,
                  question: t(`faq.${key}.q`),
                  answer: t(`faq.${key}.a`),
                }))}
              />
            </div>

            {/* Summary rail: a plain card above the content on mobile, sticky
                beside it on desktop. */}
            <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-50 text-navy-700">
                  <PassportIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
                    {country}
                  </p>
                  <p className="truncate font-bold text-navy-900">{name}</p>
                </div>
              </div>

              <dl className="mt-6 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-sand-500">{tVisas("price")}</dt>
                  <dd className="text-2xl font-bold text-navy-900">
                    {formatPrice(visa.price, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-sm text-sand-500">
                    <ClockIcon className="h-4 w-4" />
                    {tVisas("processingLabel")}
                  </dt>
                  <dd className="font-semibold text-navy-900">
                    {tVisas("days", { days: visa.processing_time_days })}
                  </dd>
                </div>
                {visa.validity_days ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-sand-500">{tVisas("validityLabel")}</dt>
                    <dd className="font-semibold text-navy-900">
                      {tVisas("days", { days: visa.validity_days })}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-4 text-xs leading-6 text-sand-500">{t("priceNote")}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link href={`/visas/${id}/apply`} className={cn(buttonVariants("primary", "md"), "w-full")}>
                  {t("applyCta")}
                </Link>
                <a
                  href={whatsappLink(t("whatsappMessage", { visa: `${name} — ${country}` }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants("outline", "md"), "w-full")}
                >
                  <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                  {tWa("short")}
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Mobile keeps the primary action reachable without scrolling back up. */}
      <div data-sticky-cta className="sticky bottom-0 z-30 border-t border-sand-200 bg-white py-2.5 shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.25)] lg:hidden">
        <Container className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-sand-500">{tVisas("price")}</p>
            <p className="truncate text-lg font-bold text-navy-900">
              {formatPrice(visa.price, locale)}
            </p>
          </div>
          <Link href={`/visas/${id}/apply`} className={buttonVariants("primary", "md")}>
            {t("applyCta")}
          </Link>
        </Container>
      </div>
    </>
  );
}
