import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import {
  BedIcon,
  GlobeIcon,
  PassportIcon,
  PinIcon,
  ShieldIcon,
  BagIcon,
  TicketIcon,
} from "@/components/ui/icons";
import { getVisaCountries } from "@/lib/api/visas";
import { getPackages } from "@/lib/api/packages";
import { getHotels } from "@/lib/api/hotels";
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
 * Every figure is verifiable rather than invented: 70+ destinations and the
 * licence from the company's own information, the branches counted from
 * siteConfig, the five services the search offers, and three live counts read
 * straight off the catalogue (visa countries, packages, hotels) — so they grow
 * as the panel does, and a count the API cannot answer is left out rather than
 * guessed. No customer counts, awards or ratings.
 *
 * One row at every width: on a phone it swipes sideways, which keeps the same
 * shape instead of breaking into a grid whose dividers land on row ends.
 */
export async function TrustSection() {
  const [t, visaCountries, packages, hotels] = await Promise.all([
    getTranslations("Trust"),
    countOf(getVisaCountries({ page_size: 1 })),
    countOf(getPackages({ page_size: 1 })),
    countOf(getHotels({ page_size: 1 })),
  ]);

  const stats = [
    { key: "destinations" as const, value: "+70", Icon: GlobeIcon },
    { key: "visaCountries" as const, value: visaCountries, Icon: PassportIcon },
    { key: "packages" as const, value: packages, Icon: BagIcon },
    { key: "hotels" as const, value: hotels, Icon: BedIcon },
    { key: "branches" as const, value: siteConfig.branches.length, Icon: PinIcon },
    { key: "services" as const, value: 5, Icon: TicketIcon },
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

        <dl className="no-scrollbar -mx-4 flex divide-x divide-sand-200 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          {stats.map(({ key, value, Icon }) => (
            <div
              key={key}
              className="flex w-28 shrink-0 flex-col items-center gap-1.5 px-2 text-center lg:w-auto lg:flex-1 lg:gap-2"
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
