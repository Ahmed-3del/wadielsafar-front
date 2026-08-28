import { cn } from "@/lib/utils/cn";

interface FlightRouteProps {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  className?: string;
}

export function FlightRoute({
  origin,
  originCode,
  destination,
  destinationCode,
  className,
}: FlightRouteProps) {
  return (
    <p className={cn("flex flex-wrap items-center gap-2 font-semibold text-navy-900", className)}>
      <span>
        {origin} <span className="text-sand-400">({originCode})</span>
      </span>
      {/* The arrow follows reading direction, so it is flipped under RTL. */}
      <span aria-hidden="true" className="inline-block text-gold-700 rtl:rotate-180">
        &rarr;
      </span>
      <span>
        {destination} <span className="text-sand-400">({destinationCode})</span>
      </span>
    </p>
  );
}
