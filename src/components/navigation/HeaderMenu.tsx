"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/ui/icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";
import type { ResolvedNavItem } from "@/types/nav-item";

interface HeaderMenuProps {
  primary: ResolvedNavItem[];
  secondary: ResolvedNavItem[];
}

/*
 * Everything the header used to spread across a nav bar, behind one button.
 *
 * The client asked for the large menu to go: the header's job is the logo and
 * a phone number, and the search immediately below it is what most visitors
 * actually came for. The pages are still all reachable — one tap away instead
 * of laid out across the top.
 */
export function HeaderMenu({ primary, secondary }: HeaderMenuProps) {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common2");
  const tWa = useTranslations("Whatsapp");
  const tLocale = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll while a full-height panel is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const section = (title: string, items: ResolvedNavItem[]) =>
    items.length > 0 ? (
      <div>
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-sand-500">{title}</p>
        <ul className="mt-2">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // Closed here rather than by watching the pathname: the
                  // click is the moment we know about, and reacting to the
                  // URL means setting state from an effect for no gain.
                  onClick={() => { setOpen(false); }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-xl px-3 py-3 text-base font-medium transition-colors",
                    active ? "bg-gold-50 text-navy-900" : "text-navy-900 hover:bg-sand-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); }}
        aria-label={tCommon("menu")}
        aria-expanded={open}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sand-200 text-navy-900 transition-colors hover:border-navy-300 hover:bg-sand-50"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Portalled to the body, not left inside the header.
          `backdrop-blur` on the header makes it the containing block for its
          fixed-position descendants — the same rule as transform and filter —
          so `inset-0` resolved against an 80px-tall bar and the drawer opened
          80px tall with the page undimmed below it. */}
      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label={tCommon("close")}
            onClick={() => { setOpen(false); }}
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
          />

          {/* Anchored to the inline end, so it opens from the same side the
              button sits on in both reading directions. */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={tCommon("menu")}
            className="absolute inset-y-0 end-0 flex w-[min(88vw,340px)] flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
              <p className="text-sm font-bold text-navy-900">{tCommon("menu")}</p>
              <button
                type="button"
                onClick={() => { setOpen(false); }}
                aria-label={tCommon("close")}
                className="grid h-9 w-9 place-items-center rounded-full text-sand-600 transition-colors hover:bg-sand-100 hover:text-navy-900"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 p-4">
              {section(t("servicesGroup"), primary)}
              {section(t("moreGroup"), secondary)}
            </div>

            <div className="border-t border-sand-200 p-4">
              {/* Where the language pills live on a phone: the header bar has
                  no room for them beside the number, and this is the drawer
                  that holds everything else the bar gave up. */}
              <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                  {tLocale("label")}
                </span>
                <LocaleSwitcher />
              </div>

              <a
                href={whatsappLink(tWa("message"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {tWa("cta")}
              </a>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
