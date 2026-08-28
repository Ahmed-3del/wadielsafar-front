import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PassportIcon, PinIcon } from "@/components/ui/icons";
import { VisaBookingWizard } from "@/features/visa-booking/VisaBookingWizard";
import { getVisaTypeById } from "@/lib/api/visas";
import { fetchDetail } from "@/lib/api/fetch-detail";
import type { Locale } from "@/i18n/routing";

interface VisaApplyPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export async function generateMetadata({ params }: VisaApplyPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const visa = await fetchDetail(getVisaTypeById(id));
  if (!visa) return {};

  const t = await getTranslations({ locale, namespace: "VisaBooking" });
  const isArabic = locale === "ar";
  return {
    title: t("metaTitle", {
      visa: `${isArabic ? visa.name_ar : visa.name_en} — ${
        isArabic ? visa.country.name_ar : visa.country.name_en
      }`,
    }),
    // An in-progress application has nothing to offer search engines and
    // should never be a landing page.
    robots: { index: false, follow: true },
  };
}

export default async function VisaApplyPage({ params }: VisaApplyPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, visa] = await Promise.all([
    getTranslations("VisaBooking"),
    fetchDetail(getVisaTypeById(id)),
  ]);
  if (!visa) notFound();

  const isArabic = locale === "ar";
  const country = isArabic ? visa.country.name_ar : visa.country.name_en;
  const visaType = isArabic ? visa.name_ar : visa.name_en;

  return (
    <Section className="bg-sand-50">
      <Container className="max-w-3xl">
        {/* The two selections carried in from the visa page, shown as read-only
            context so the applicant can confirm what they are applying for
            without losing their place. */}
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: t("labels.country"), value: country, Icon: PinIcon },
            { label: t("labels.visaType"), value: visaType, Icon: PassportIcon },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-sand-500">{label}</span>
                <span className="block truncate font-bold text-navy-900">{value}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">
            {t("title", { country })}
          </h1>
          <p className="mt-2 text-sand-600">{t("subtitle")}</p>
          <Link
            href={`/visas/${id}`}
            className="mt-3 inline-flex text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            {t("backToRequirements")}
          </Link>
        </div>

        <div className="mt-9">
          <VisaBookingWizard
            context={{
              visaId: visa.id,
              country,
              visaType,
              price: visa.price,
              processingDays: visa.processing_time_days,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
