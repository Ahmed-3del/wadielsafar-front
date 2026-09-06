"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { CloseIcon, TagIcon } from "@/components/ui/icons";

const DISMISSED_KEY = "wadi-promo-dismissed";

/*
 * localStorage is an external store, so it is read as one rather than copied
 * into state from an effect. useSyncExternalStore also gives the server
 * snapshot a separate answer, which is what keeps the bar out of the HTML.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function isDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    // Private mode, or site data blocked. Showing the offer is the safe
    // default — the reader can always dismiss it again.
    return false;
  }
}

// On the server the bar is always "dismissed", so it is absent from the HTML
// and appears after hydration. Rendering it server-side and then removing it
// for someone who already dismissed it moves the whole page under them.
const isDismissedOnServer = () => true;

function dismissPromo() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    /* Nothing to do: it reappears next visit, which is not a failure. */
  }
  listeners.forEach((listener) => { listener(); });
}

/*
 * The new-customer offer, across the top of every page.
 *
 * The dismissal is per-browser and per-device: localStorage is the right
 * amount of memory for "I have seen this", and there is no account to hang it
 * on. A cleared browser sees it again, which is the intended behaviour for a
 * standing offer rather than a one-time announcement.
 */
export function PromoBar() {
  const t = useTranslations("Promo");
  const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer);
  const dismiss = useCallback(() => { dismissPromo(); }, []);

  if (dismissed) return null;

  return (
    <div className="relative z-[60] bg-linear-to-r from-navy-900 via-navy-700 to-navy-900 text-white">
      <Container className="flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 pe-9 text-center text-xs sm:text-sm">
        <TagIcon aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-gold-400 sm:block" />

        <span className="font-medium">{t("headline")}</span>

        {/* The code is the one thing here that has to be copied exactly, so it
            is set apart rather than run into the sentence. */}
        <span className="inline-flex items-center gap-1.5">
          <span className="text-white/70">{t("codeLabel")}</span>
          <code
            dir="ltr"
            className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-gold-300"
          >
            {t("code")}
          </code>
        </span>

        <Link
          href="/contact"
          className="rounded-full bg-gold-500 px-3.5 py-1 text-xs font-bold text-navy-900 transition-colors hover:bg-gold-400"
        >
          {t("cta")}
        </Link>
      </Container>

      {/* Absolute so the button never reflows the message on a narrow screen. */}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute inset-y-0 end-1 my-auto grid h-8 w-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
