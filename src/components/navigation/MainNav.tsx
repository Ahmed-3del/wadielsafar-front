"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { ResolvedNavItem } from "@/types/nav-item";
import { cn } from "@/lib/utils/cn";

export function MainNav({ items }: { items: ResolvedNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-navy-900" : "text-sand-600 hover:text-navy-900",
            )}
          >
            {item.label}
            {/* Underline rather than a filled pill: with eight items, filled
                active states make the bar look like a row of buttons. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500 transition-transform duration-300 ease-out-soft",
                active ? "scale-x-100" : "scale-x-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
