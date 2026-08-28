import type { ComponentType, SVGProps } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

export interface FeatureItem {
  id: string;
  title: string;
  body: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface FeatureGridProps {
  items: FeatureItem[];
  className?: string;
}

/*
 * Icon-and-paragraph cards. Extracted because three separate pages had grown
 * their own copy of the same markup, and a card that lifts by 4px on one page
 * and 8px on another is the kind of drift nobody reports but everybody feels.
 */
export function FeatureGrid({ items, className }: FeatureGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map(({ id, title, body, Icon }, index) => (
        <Reveal key={id} delay={index * 60}>
          <div className="card-lift h-full rounded-2xl border border-sand-200 bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-50 text-gold-700">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-navy-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-7 text-sand-600">{body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
