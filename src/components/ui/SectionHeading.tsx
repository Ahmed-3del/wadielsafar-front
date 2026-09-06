import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  /** `onDark` for the sections that sit on the navy field. Gold at 700 on
   *  navy is 2.1:1 — legible on sand, not on the dark band. */
  tone?: "onLight" | "onDark";
  className?: string;
}

const TONES = {
  onLight: {
    eyebrow: "text-gold-700",
    title: "text-navy-900",
    description: "text-sand-600",
  },
  onDark: {
    eyebrow: "text-gold-400",
    title: "text-white",
    description: "text-white/70",
  },
} as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  tone = "onLight",
  className,
}: SectionHeadingProps) {
  const colors = TONES[tone];

  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("text-sm font-semibold uppercase tracking-wide", colors.eyebrow)}>
          {eyebrow}
        </p>
      ) : null}
      {/* One step smaller on a phone. At text-3xl with an 18px description,
          the heading and its blurb ran to 260px — a third of the screen — and
          the cards underneath opened below the fold. */}
      <h2 className={cn("mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl lg:text-4xl", colors.title)}>
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-2.5 text-base leading-7 sm:mt-4 sm:text-lg sm:leading-8", colors.description)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
