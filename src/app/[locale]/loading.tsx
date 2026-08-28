import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BrandedLoader } from "@/components/ui/BrandedLoader";
import { CardGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/*
 * Route-level waiting state for everything under /[locale]. It sits inside the
 * locale layout, so the header, footer and tab bar stay put and stay
 * interactive — only the page body is replaced while it streams.
 *
 * It is shaped like a page rather than centred in the viewport. Almost every
 * route here opens with a banner and continues into a grid, so standing those
 * two blocks up keeps the layout still when the real content lands, and stops
 * the screen reading as a blank page with a mark floating in the middle of it.
 */
export default async function Loading() {
  const t = await getTranslations("Common");

  return (
    <>
      <div className="bg-sand-100">
        <Container className="flex min-h-56 items-center justify-center py-10 sm:min-h-72">
          <BrandedLoader label={t("loading")} className="py-0" />
        </Container>
      </div>

      <Section>
        <Container>
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
          <CardGridSkeleton />
        </Container>
      </Section>
    </>
  );
}
