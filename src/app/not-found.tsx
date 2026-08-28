import Link from "next/link";
import { routing } from "@/i18n/routing";
import messages from "../../messages/ar.json";

// Rendered when no [locale] segment matches at all, so it can't rely on
// next-intl's request context; the root layout is a pass-through with no
// <html>/<body>, so this file supplies its own using the default locale.
export default function NotFound() {
  const t = messages.NotFound;

  return (
    <html lang={routing.defaultLocale} dir="rtl">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h1 className="text-3xl font-bold text-navy-900">{t.title}</h1>
        <p className="text-sand-600">{t.description}</p>
        <Link
          href={`/${routing.defaultLocale}`}
          className="font-semibold text-gold-700 hover:text-gold-800"
        >
          {t.backHome}
        </Link>
      </body>
    </html>
  );
}
