import { MediaImage } from "@/components/ui/MediaImage";
import { HeroVideo } from "./HeroVideo";
import type { PageHero } from "@/types/page-hero";

interface HeroBackgroundProps {
  hero: PageHero | null;
  /** Hero images are above the fold and should not lazy-load. */
  priority?: boolean;
}

/*
 * Renders whatever background an editor configured for this page, falling back
 * to the brand gradient when nothing is set — which is the default state, not
 * an error, so it has to look deliberate.
 *
 * A video hero still renders its poster as a normal image underneath: the
 * <video> only mounts on wide viewports without a reduced-motion preference,
 * so the poster is what most mobile visitors actually see.
 */
export function HeroBackground({ hero, priority }: HeroBackgroundProps) {
  const gradient = (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-navy-950 via-navy-900 to-navy-700"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_75%_15%,var(--color-gold-500),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:26px_26px]"
      />
    </>
  );

  if (!hero || hero.media_type === "NONE") return gradient;

  const stillImage = hero.media_type === "VIDEO" ? hero.poster_url : hero.image_url;

  return (
    <>
      {/* Navy base so the band is never white while media loads. */}
      <div aria-hidden="true" className="absolute inset-0 bg-navy-900" />
      {stillImage ? (
        <MediaImage
          src={stillImage}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover"
        />
      ) : null}
      {hero.media_type === "VIDEO" && hero.video_url ? (
        <HeroVideo src={hero.video_url} poster={hero.poster_url} />
      ) : null}
      {/* Editor-controlled scrim: photography brightness varies enormously and
          this is what keeps the headline readable over it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-navy-950"
        style={{ opacity: hero.overlay_opacity / 100 }}
      />
    </>
  );
}
