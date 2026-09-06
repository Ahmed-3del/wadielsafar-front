import Image from "next/image";
import markArt from "@/assets/brand/logo-mark.png";
import wordsArt from "@/assets/brand/logo-words.png";
import fullArt from "@/assets/brand/logo-full.png";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  /** Localized company name. The supplied wordmark is Arabic-only, so the name
      travels as the image's text alternative rather than as visible text. */
  name: string;
  /**
   * `stacked` is the supplied artwork as drawn — mark over wordmark over
   * tagline. `horizontal` is the same three pieces laid side by side, for bars
   * that are wider than they are tall.
   */
  variant?: "horizontal" | "stacked";
  /** Preload. Worth it in the header, wasteful in the footer. */
  priority?: boolean;
  className?: string;
}

/*
 * Every piece here is cut from the one supplied file, so the mark in the header
 * and the lockup in the footer cannot drift apart. See src/assets/brand/.
 *
 * The header uses the horizontal arrangement because the artwork as drawn is a
 * vertical stack of near-square proportion: fitted into the 64/80px bar it puts
 * the wordmark at ~10px and the tagline at ~3px, which is a smudge. Laid out
 * horizontally the same bar gives the wordmark ~20px and the tagline ~9px.
 */
export function Logo({ name, variant = "horizontal", priority = false, className }: LogoProps) {
  if (variant === "stacked") {
    return (
      <Image
        src={fullArt}
        alt={name}
        priority={priority}
        sizes="(min-width: 640px) 107px, 92px"
        className={cn("h-24 w-auto sm:h-28", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={markArt}
        alt=""
        aria-hidden="true"
        priority={priority}
        sizes="(min-width: 640px) 66px, 49px"
        className="h-9 w-auto sm:h-12"
      />
      {/* The wordmark image *is* the company name set in the brand face, so it
          carries the text alternative rather than being decorative. */}
      <Image
        src={wordsArt}
        alt={name}
        priority={priority}
        sizes="(min-width: 640px) 116px, 89px"
        /* Dropped on phones, where those 89px are the difference between a
           header that fits and a phone number that wraps mid-sentence. The
           mark still reads as the brand, and the link carries the name. */
        className="h-6.5 w-auto max-[479px]:hidden sm:h-8.5"
      />
    </span>
  );
}
