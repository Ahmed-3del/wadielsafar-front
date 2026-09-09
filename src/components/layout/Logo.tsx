import Image from "next/image";
import lockupArt from "@/assets/brand/logo-horizontal.png";
import markArt from "@/assets/brand/logo-mark.png";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  /** Localized company name. The wordmark is Arabic-only artwork, so the name
      travels as the image's text alternative rather than as visible text. */
  name: string;
  /**
   * `bar` fits a header: the mark alone on a narrow phone, the whole lockup
   * from 480px up. `full` is the lockup at the size a footer can afford.
   */
  variant?: "bar" | "full";
  /** Preload. Worth it in the header, wasteful in the footer. */
  priority?: boolean;
  className?: string;
}

/*
 * One image, not a composition.
 *
 * The previous artwork was a vertical stack, so the header cut it into a mark
 * and a wordmark and laid them side by side to get something that fitted a
 * bar. The delivered lockup is already horizontal — and its words sit on both
 * sides of the mark, so there is nothing to lay out even if we wanted to. See
 * docs/brand/.
 *
 * At 2.7:1 the whole lockup is 118px wide in a phone's header, which is what
 * pushed the phone number into wrapping the last time this was tuned. Below
 * 480px the mark goes in alone and the link's own label carries the name.
 */
export function Logo({ name, variant = "bar", priority = false, className }: LogoProps) {
  if (variant === "full") {
    return (
      <Image
        src={lockupArt}
        alt={name}
        priority={priority}
        /* Not larger: at 2.7:1 an h-28 lockup is 301px wide, and the footer
           column it sits in is 299px at the width the grid first goes to four
           columns — flush against both edges. */
        sizes="(min-width: 640px) 215px, 172px"
        className={cn("h-16 w-auto sm:h-20", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={markArt}
        alt={name}
        priority={priority}
        sizes="53px"
        className="h-10 w-auto min-[480px]:hidden"
      />
      <Image
        src={lockupArt}
        alt={name}
        priority={priority}
        sizes="(min-width: 1024px) 151px, 118px"
        className="hidden h-11 w-auto min-[480px]:block lg:h-14"
      />
    </span>
  );
}
