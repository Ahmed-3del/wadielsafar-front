import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { heroCopy } from "@/lib/utils/hero-copy";
import { cn } from "@/lib/utils/cn";
import type { PageHero } from "@/types/page-hero";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Editor-configured hero for this page; null falls back to the gradient. */
  hero?: PageHero | null;
  /** Whether the caller's locale is Arabic, for picking hero copy overrides. */
  isArabic?: boolean;
  /** Short facts rendered under the title — duration, price, count, and such. */
  facts?: ReactNode;
  /** Optional slot for a search/filter bar that belongs with the title. */
  children?: ReactNode;
}

/*
 * Shared banner for every inner page. Having one of these — rather than each
 * page inventing its own heading block — is what keeps the site feeling like a
 * single product as pages are added, and it means making every hero editable
 * was a change in one file rather than eleven.
 *
 * A banner carrying photography is given real height and its copy is dropped to
 * the bottom edge; the flat gradient fallback stays compact. A photograph
 * squeezed into a 12rem strip is worse than no photograph, and a tall band of
 * plain navy is just an empty screen.
 */
export function PageHeader({
  title,
  description,
  hero = null,
  isArabic = true,
  facts,
  children,
}: PageHeaderProps) {
  const copy = heroCopy(hero, isArabic, {
    eyebrow: "",
    title,
    subtitle: description ?? "",
  });

  const hasMedia = !!hero && hero.media_type !== "NONE";

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <HeroBackground hero={hero} priority />

      {/* Legibility floor under the copy. The editor's own scrim sets the mood
          of the photograph; this one only guarantees the text stays readable
          whatever they chose. */}
      {hasMedia ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950/85 via-navy-950/35 to-transparent"
        />
      ) : null}

      <Container
        className={cn(
          "relative",
          hasMedia
            ? "flex min-h-[19rem] flex-col justify-end pb-10 pt-24 sm:min-h-[23rem] sm:pb-12"
            : "py-12 sm:py-16",
        )}
      >
        {copy.eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {copy.eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {copy.title}
        </h1>
        {copy.subtitle ? (
          <p className="mt-4 max-w-2xl text-base leading-8 text-navy-100">{copy.subtitle}</p>
        ) : null}
        {facts ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-100">
            {facts}
          </div>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
