import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type MediaImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
} & ({ fill: true; sizes: string } | { fill?: false; width: number; height: number });

/*
 * Renders content imagery, falling back to a brand-coloured block when a record
 * has no image. The fallback is deliberately not a random stock photo: an
 * editor who forgets an image should get something neutral and on-brand, not an
 * unpredictable third-party picture fetched at request time.
 */
export function MediaImage({ src, alt, className, priority, ...size }: MediaImageProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "bg-linear-to-br from-navy-800 to-navy-600",
          size.fill ? "absolute inset-0 h-full w-full" : "",
          className,
        )}
        style={size.fill ? undefined : { width: size.width, height: size.height }}
      />
    );
  }

  return size.fill ? (
    <Image src={src} alt={alt} fill sizes={size.sizes} priority={priority} className={className} />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      priority={priority}
      className={className}
    />
  );
}
