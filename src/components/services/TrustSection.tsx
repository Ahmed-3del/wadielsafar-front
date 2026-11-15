import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

/*
 * "Why Wadi Al Safar" as one slim row of figures — a number over a short line,
 * with hairlines between them — rather than a navy band of icons and
 * paragraphs. The client asked for it small and simple; four facts read at a
 * glance, and the band no longer costs a screen of phone.
 *
 * Every figure is verifiable from the company's own information: 70+
 * destinations, the branches listed in the footer (counted from siteConfig, so
 * opening a branch updates it), the five services the search offers, and the
 * licence behind the commercial registry number. No invented customer counts,
 * awards or ratings.
 */
export async function TrustSection() {
  const t = await getTranslations("Trust");

  const stats = [
    { key: "destinations", value: "+70" },
    { key: "branches", value: String(siteConfig.branches.length) },
    { key: "services", value: "5" },
    { key: "licensed", value: t("stats.licensed.value") },
  ] as const;

  return (
    <section aria-labelledby="trust-heading" className="bg-sand-50 py-6 sm:py-10">
      <Container>
        {/* Named for screen readers, not shown: the figures are the whole
            design, and a heading above them is the bulk this replaced. */}
        <h2 id="trust-heading" className="sr-only">
          {t("eyebrow")}
        </h2>

        <dl className="divide-sand-200 grid grid-cols-4 divide-x">
          {stats.map(({ key, value }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1 px-1 text-center sm:gap-2 sm:px-4"
            >
              <dt className="text-sand-600 order-2 text-[11px] leading-4 sm:text-sm sm:leading-5">
                {t(`stats.${key}.label`, { cr: siteConfig.registration.commercialRegistry })}
              </dt>
              <dd
                // Figures read left to right in both languages; the one word
                // ("Licensed") follows the page.
                dir={key === "licensed" ? undefined : "ltr"}
                className="text-navy-800 order-1 text-lg leading-none font-bold sm:text-3xl lg:text-4xl"
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
