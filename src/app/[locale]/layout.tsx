import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { PromoBar } from "@/components/layout/PromoBar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { BottomNav } from "@/components/navigation/BottomNav";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { getOrganizationJsonLd } from "@/lib/utils/json-ld";
import { resolveNav } from "@/lib/api/resolve-nav";
import { siteConfig } from "@/config/site";
import "../globals.css";

// Arabic is the primary language, so the typeface is chosen for its Arabic
// cuts first; Tajawal also covers Latin, which keeps English pages on the
// same family instead of mixing two unrelated fonts.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

// ISR window for every page under /[locale]. Content is edited in the admin
// panel, so pages must not stay frozen at build time — but they're also
// SEO-critical and read far more often than they change, which rules out
// per-request rendering. Five minutes is the compromise: editors see their
// change shortly after publishing, and readers still get static HTML.
export const revalidate = 300;

/*
 * viewportFit "cover" is what lets the page paint under a notch and a home
 * indicator; the tab bar and every sticky bar then use env(safe-area-inset-*)
 * to stay clear of them. Without it those insets are always zero.
 */
export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
  // Pinch-zoom stays available — capping it is an accessibility regression, and
  // the 16px form controls already stop iOS zooming on focus by itself.
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  // Not yet validated here (that happens in the layout body below); fall
  // back to the default locale so the typed getTranslations() call below
  // always receives a genuine Locale rather than an arbitrary string.
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { template: t("titleTemplate"), default: t("title") },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
    appleWebApp: {
      capable: true,
      title: siteConfig.nameAr,
      statusBarStyle: "default",
    },
    /*
     * No `alternates` here on purpose. This is the layout, so anything it
     * declares is inherited by every page — which meant /ar/packages was
     * telling search engines its English version was the English homepage.
     * Metadata cannot see the pathname without opting into a dynamic render,
     * which would cost the ISR window. next-intl's middleware already emits a
     * path-correct `Link: rel="alternate"` header on every response, and
     * sitemap.ts lists the same pairs; both are first-class hreflang signals.
     */
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const jsonLd = getOrganizationJsonLd();
  const nav = await resolveNav();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={tajawal.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          // Organization schema for search engines; not user-facing markup.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <PromoBar />
          <Header />
          <RouteTransition>{children}</RouteTransition>
          <Footer />
          <WhatsAppFab />
          <BottomNav primary={nav.primary} secondary={nav.secondary} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
