"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import type { ResolvedNavItem } from "@/types/nav-item";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  primary: ResolvedNavItem[];
  secondary: ResolvedNavItem[];
}

/*
 * The full menu, as a sheet. It holds no state of its own: the bottom bar owns
 * whether it is open, because the bar is what opens it and what it has to sit
 * above. Two components each holding their own idea of "open" is how you end up
 * with a menu that will not close.
 */
export function MobileNav({ open, onClose, primary, secondary }: MobileNavProps) {
  const tCommon = useTranslations("Common2");
  const pathname = usePathname();

  // Lock body scroll while the sheet covers the viewport.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 z-50 flex flex-col overflow-y-auto overscroll-contain bg-white lg:hidden",
        // Stops above the tab bar rather than under it: the sheet's own action
        // row is sticky to its bottom edge, and the bar would have covered it.
        "bottom-[var(--bottom-nav-height)]",
      )}
    >
      <nav className="flex-1 px-4 py-5">
        <ul className="space-y-1">
          {primary.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors",
                    active ? "bg-navy-50 text-navy-900" : "text-navy-900 hover:bg-sand-50",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold-500" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="mt-5 space-y-1 border-t border-sand-200 pt-5">
          {secondary.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="block rounded-xl px-4 py-3 text-base font-medium text-sand-600 transition-colors hover:bg-sand-50 hover:text-navy-900"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* One action, full width. WhatsApp used to sit beside it, but the tab
          bar's centre button is now directly below this row — two identical
          green buttons a thumb's width apart is a choice nobody wants to make. */}
      <div className="sticky bottom-0 border-t border-sand-200 bg-white p-4">
        <Link
          href="/contact"
          onClick={onClose}
          className={cn(buttonVariants("primary", "lg"), "w-full")}
        >
          {tCommon("bookNow")}
        </Link>
      </div>
    </div>
  );
}
