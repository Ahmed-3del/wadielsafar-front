import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-700">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg text-sand-600">{description}</p> : null}
    </div>
  );
}
