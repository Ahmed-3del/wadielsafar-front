import Image from "next/image";
import markArt from "@/assets/brand/logo-mark.png";
import { PlaneMarkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface BrandedLoaderProps {
  /** Announced to screen readers and shown under the mark. */
  label: string;
  className?: string;
}

/*
 * The waiting state for a whole route. It is deliberately the logo rather than
 * a neutral spinner: this is the one moment the traveller has nothing to look
 * at, and a generic spinner spends it saying nothing.
 *
 * The mark stays upright and only breathes — rotating a logo makes it
 * unreadable — while the plane does the travelling around it.
 */
export function BrandedLoader({ label, className }: BrandedLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-6 py-24", className)}
    >
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-gold-500/45">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
        </svg>

        <div className="brand-orbit absolute inset-0">
          <PlaneMarkIcon className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gold-500" />
        </div>

        <Image
          src={markArt}
          alt=""
          aria-hidden="true"
          sizes="72px"
          priority
          className="brand-pulse absolute left-1/2 top-1/2 h-12 w-auto -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <p className="text-sm font-medium tracking-wide text-sand-500">{label}</p>
    </div>
  );
}
