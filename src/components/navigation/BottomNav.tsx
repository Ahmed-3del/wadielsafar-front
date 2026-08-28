"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MobileNav } from "./MobileNav";
import type { ResolvedNavItem } from "@/types/nav-item";
import {
  HomeIcon,
  BagIcon,
  PassportIcon,
  MenuIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";

type TabKey = "home" | "packages" | "visas";

const TABS: { key: TabKey; href: string; Icon: typeof HomeIcon }[] = [
  { key: "home", href: "/", Icon: HomeIcon },
  { key: "packages", href: "/packages", Icon: BagIcon },
  { key: "visas", href: "/visas", Icon: PassportIcon },
];

/*
 * App-style tab bar for phones and tablets. Five slots, because a thumb can
 * reach five and not eight — the other pages live behind "more", which opens
 * the full menu.
 *
 * WhatsApp takes the raised centre slot rather than being a floating button.
 * It is where enquiries actually close, and a floating action would have had to
 * dodge this bar and the sticky price bars on detail pages anyway. One
 * prominent target beats two competing ones.
 */
interface BottomNavProps {
  /* The sheet behind "more" shows the editable navigation; the five fixed
     slots below do not, because they are a designed set rather than a list. */
  primary: ResolvedNavItem[];
  secondary: ResolvedNavItem[];
}

export function BottomNav({ primary, secondary }: BottomNavProps) {
  const t = useTranslations("BottomNav");
  const tWa = useTranslations("Whatsapp");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Cruises, offers, corporate and the rest have no tab of their own. Leaving
  // every tab dim on those pages loses the reader's place; "more" is where they
  // came from, so that is what lights up.
  const onHiddenPage = !TABS.some((tab) => isActive(tab.href));
  const moreHighlighted = menuOpen || onHiddenPage;

  /*
   * One renderer for all five slots. WhatsApp used to be a raised 52px circle
   * beside 22px icons, which made it the only thing in the bar anyone saw.
   * It keeps its colour — that is enough to mark it out — but not its size.
   */
  const tabClass =
    "flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold transition-colors";

  const tabInner = (Icon: typeof HomeIcon, label: string, active: boolean, green = false) => (
    <>
      {/* A filled pill behind the icon rather than a hairline at the top edge:
          at arm's length the highlight is what identifies the current tab. */}
      <span
        className={cn(
          "grid h-8 w-14 place-items-center rounded-full transition-colors duration-200 ease-out-soft",
          active && "bg-gold-50",
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6",
            green ? "text-whatsapp" : active ? "text-gold-600" : "text-sand-500",
          )}
        />
      </span>
      <span className={active ? "text-navy-900" : "text-sand-500"}>{label}</span>
    </>
  );

  return (
    <>
      <MobileNav
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
        }}
        primary={primary}
        secondary={secondary}
      />

      <nav
        aria-label={t("label")}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-sand-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_24px_-14px_rgb(6_9_64_/_0.18)] lg:hidden"
      >
        <ul className="flex h-16 items-stretch">
          {TABS.map(({ key, href, Icon }) => {
            const active = isActive(href);
            return (
              <li key={key} className="flex flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={tabClass}
                >
                  {tabInner(Icon, t(key), active)}
                </Link>
              </li>
            );
          })}

          <li className="flex flex-1">
            <a
              href={whatsappLink(tWa("message"))}
              target="_blank"
              rel="noopener noreferrer"
              className={tabClass}
            >
              {tabInner(WhatsAppIcon, t("whatsapp"), false, true)}
            </a>
          </li>

          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
              aria-expanded={menuOpen}
              className={tabClass}
            >
              {tabInner(MenuIcon, menuOpen ? t("close") : t("more"), moreHighlighted)}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
