import { cn } from "@/lib/utils/cn";

interface StarRatingProps {
  value: number;
  /** Spoken equivalent of the stars, e.g. "5 star hotel". */
  label: string;
  className?: string;
}

export function StarRating({ value, label, className }: StarRatingProps) {
  return (
    <span role="img" aria-label={label} className={cn("inline-flex gap-0.5 text-gold-500", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < value ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
