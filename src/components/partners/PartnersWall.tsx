import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import { getPartners } from "@/lib/api/partners";
import { safeResults } from "@/lib/api/client";

/*
 * The logo wall. Editors control the list and its order from the panel, and the
 * section removes itself when the list is empty — an empty logo wall says
 * something about a travel company that an absent one does not.
 *
 * Logos are greyed back until hovered: a row of competing brand colours pulls
 * harder than anything the page is actually asking the reader to do.
 */
export async function PartnersWall() {
  const [t, locale, partners] = await Promise.all([
    getTranslations("Partners"),
    getLocale(),
    safeResults(getPartners({ page_size: 40 })),
  ]);

  const visible = partners.filter((partner) => partner.logo);
  if (visible.length === 0) return null;

  const isArabic = locale === "ar";

  return (
    <Section className="bg-sand-50">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        <ul className="mt-6 sm:mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((partner, index) => {
            const name = isArabic ? partner.name_ar : partner.name_en;
            const logo = (
              <MediaImage
                src={partner.logo}
                alt={name}
                width={200}
                height={80}
                className="h-10 w-auto max-w-[70%] object-contain opacity-70 grayscale transition duration-300 ease-out-soft group-hover:opacity-100 group-hover:grayscale-0 sm:h-12"
              />
            );

            return (
              <li key={partner.id}>
                <Reveal delay={Math.min(index, 6) * 50}>
                  {partner.website_url ? (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      title={name}
                      className="card-lift group grid h-24 place-items-center rounded-2xl border border-sand-200 bg-white p-4"
                    >
                      {logo}
                    </a>
                  ) : (
                    /* No link rather than a dead one: plenty of partners have
                       no site worth sending anyone to. */
                    <div className="group grid h-24 place-items-center rounded-2xl border border-sand-200 bg-white p-4">
                      {logo}
                    </div>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
