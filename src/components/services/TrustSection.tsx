import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import {
  GlobeIcon,
  PassportIcon,
  PinIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { getVisaCountries } from "@/lib/api/visas";
import { siteConfig } from "@/config/site";
import type { PaginatedResponse } from "@/types/api";

/** The catalogue's own total, or null when the API cannot say. */
async function countOf(request: Promise<PaginatedResponse<unknown>>): Promise<number | null> {
  try {
    const { count } = await request;
    return count > 0 ? count : null;
  } catch {
    return null;
  }
}

/*
 * "Why Wadi Al Safar" as one slim row of figures — a small gold mark, a number,
 * a short line, with hairlines between them. The client asked for it small
 * and simple, and then for more figures in the same shape.
 *
 * Four figures — the client's pick of the ones that matter. Every one is
 * verifiable rather than invented: 70+ destinations and the licence from the
 * company's own information, the branches counted from siteConfig, and the
 * visa countries read live off the catalogue, so it grows as the panel does
 * (and is left out, not guessed, when the API cannot answer). No customer
 * counts, awards or ratings.
 *
 * One row of four at every width — four fit a phone without swiping.
 */
export async function TrustSection() {
  const [t, visaCountries] = await Promise.all([
    getTranslations("Trust"),
    countOf(getVisaCountries({ page_size: 1 })),
  ]);

  const stats = [
    { key: "destinations" as const, value: "+70", Icon: GlobeIcon },
    { key: "visaCountries" as const, value: visaCountries, Icon: PassportIcon },
    { key: "branches" as const, value: siteConfig.branches.length, Icon: PinIcon },
    { key: "licensed" as const, value: t("stats.licensed.value"), Icon: ShieldIcon },
  ].filter((stat) => stat.value !== null);

  return (
    <section aria-labelledby="trust-heading" className="bg-sand-50 py-5 sm:py-8">
      <Container>
        {/* Named for screen readers, not shown: the figures are the whole
            design, and a heading above them is the bulk this replaced. */}
        <h2 id="trust-heading" className="sr-only">
          {t("eyebrow")}
        </h2>

        <dl className="grid grid-cols-4 divide-x divide-sand-200">
          {stats.map(({ key, value, Icon }) => (
            <div
              key={key}
              className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center sm:px-2 lg:gap-2"
            >
              <dt className="order-3 text-[11px] leading-4 text-sand-600 sm:text-sm sm:leading-5">
                {t(`stats.${key}.label`, { cr: siteConfig.registration.commercialRegistry })}
              </dt>
              <Icon aria-hidden="true" className="order-1 h-5 w-5 text-gold-600 sm:h-6 sm:w-6" />
              <dd
                // Figures read left to right in both languages; the one word
                // ("Licensed") follows the page.
                dir={key === "licensed" ? undefined : "ltr"}
                className="order-2 text-xl leading-none font-bold text-navy-800 sm:text-3xl"
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
