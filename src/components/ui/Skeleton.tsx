import { cn } from "@/lib/utils/cn";

/** Neutral shimmer block. Compose these into shapes rather than adding a
 *  bespoke skeleton component per card type. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-sand-200/70", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 sm:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
