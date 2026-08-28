"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLinkIcon } from "@/components/ui/icons";
import type { Certificate } from "@/types/company";
import { cn } from "@/lib/utils/cn";

interface CertificateWallProps {
  certificates: Certificate[];
  /** The wall sits beside the registration numbers rather than under them, so
   *  the caller owns its spacing. */
  className?: string;
}

/** A PDF can be shown in place; an authority's verification page cannot —
 *  almost all of them refuse to be framed. Those open in a new tab instead. */
function isEmbeddable(url: string): boolean {
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

/*
 * The company's credentials, and the documents behind them.
 *
 * A badge that cannot be checked is decoration, so every tile that has a
 * document opens it. Certificates with no artwork yet are still listed — as a
 * named credential rather than a badge — because the licence is real whether
 * or not the company has sent over the mark to go with it.
 */
export function CertificateWall({ certificates, className }: CertificateWallProps) {
  const t = useTranslations("Certificates");
  const isArabic = useLocale() === "ar";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Certificate | null>(null);

  // showModal() rather than an `open` attribute: it is what puts the dialog in
  // the top layer, traps focus and makes Escape work, none of which come free
  // with a div.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  if (certificates.length === 0) return null;

  const nameOf = (c: Certificate) => (isArabic ? c.name_ar : c.name_en);
  const issuerOf = (c: Certificate) => (isArabic ? c.issuer_ar : c.issuer_en);

  function open(certificate: Certificate) {
    if (isEmbeddable(certificate.document)) {
      setActive(certificate);
      return;
    }
    window.open(certificate.document, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <ul className={cn("flex flex-wrap items-stretch gap-3", className)}>
        {certificates.map((certificate) => {
          const name = nameOf(certificate);
          const issuer = issuerOf(certificate);
          const clickable = Boolean(certificate.document);

          const body = certificate.image ? (
            /* Bounded on both axes, not just height. These marks arrive in
               whatever shape the ministry publishes them in — one is 2.35:1,
               the next is a square — and sizing on height alone rendered the
               square one at a third of the width of its neighbour. */
            <Image
              src={certificate.image}
              alt={name}
              width={200}
              height={200}
              // A pixel cap rather than max-h-full: the tile centres its child
              // instead of stretching it, so a percentage height has nothing
              // definite to resolve against and a square logo spilled past the
              // tile's bottom edge.
              className="max-h-14 w-auto max-w-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-start gap-0.5 text-start">
              <span className="text-sm font-semibold text-navy-900">{name}</span>
              {issuer ? <span className="text-xs text-sand-500">{issuer}</span> : null}
              {certificate.reference_number ? (
                <span dir="ltr" className="text-xs font-medium text-sand-600">
                  {t("number", { number: certificate.reference_number })}
                </span>
              ) : null}
            </span>
          );

          const tileClass = cn(
            "grid place-items-center rounded-xl border border-sand-200 bg-white transition-all duration-200",
            // Badges share one box so the row reads as a set. A certificate
            // with no artwork is a line of text and takes the width it needs.
            certificate.image ? "h-20 w-36 p-3" : "h-20 min-w-40 px-4",
            clickable && "cursor-pointer hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md",
          );

          return (
            <li key={certificate.id}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => { open(certificate); }}
                  aria-label={`${name} — ${t("open")}`}
                  className={tileClass}
                >
                  {body}
                </button>
              ) : (
                <span className={tileClass}>{body}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* backdrop:* styles the ::backdrop pseudo-element, which is the only way
          to dim the page behind a top-layer dialog. */}
      <dialog
        ref={dialogRef}
        onClose={() => { setActive(null); }}
        onClick={(event) => {
          // Clicking the backdrop lands on the dialog itself, never on a child.
          if (event.target === dialogRef.current) setActive(null);
        }}
        className="m-auto w-[min(96vw,880px)] rounded-2xl border border-sand-200 bg-sand-50 p-0 shadow-2xl backdrop:bg-navy-900/60 backdrop:backdrop-blur-sm"
      >
        {active ? (
          <div className="flex max-h-[88vh] flex-col" dir={isArabic ? "rtl" : "ltr"}>
            <div className="flex items-start gap-4 border-b border-sand-200 bg-white px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-navy-900">{nameOf(active)}</p>
                {issuerOf(active) ? (
                  <p className="mt-0.5 text-xs text-sand-500">
                    {t("issuedBy", { issuer: issuerOf(active) })}
                  </p>
                ) : null}
                {active.reference_number ? (
                  <p dir="ltr" className="mt-0.5 text-xs font-medium text-sand-600">
                    {t("number", { number: active.reference_number })}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => { setActive(null); }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sand-200 text-sand-600 transition-colors hover:border-navy-300 hover:text-navy-900"
                aria-label={t("close")}
              >
                <span aria-hidden="true" className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* #view=FitH so the page arrives fitted to the width rather than
                at whatever zoom the viewer last remembered. */}
            <iframe
              src={`${active.document}#view=FitH`}
              title={nameOf(active)}
              className="h-[46vh] w-full bg-sand-100 sm:h-[62vh]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 bg-white px-5 py-3">
              {/* iOS Safari renders a PDF in an iframe as a static first page
                  at best, so the way out is never more than one tap away. */}
              <p className="text-xs text-sand-500">{t("hint")}</p>
              <a
                href={active.document}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                {t("newTab")}
              </a>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
