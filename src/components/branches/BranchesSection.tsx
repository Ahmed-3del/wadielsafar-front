import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MapIcon, PinIcon } from "@/components/ui/icons";
import { mapEmbedSrc, usesGoogleEmbed } from "@/lib/utils/maps";
import { cn } from "@/lib/utils/cn";
import { BranchCard } from "./BranchCard";
import type { Branch } from "@/types/company";

/*
 * The branches band: full-bleed and dark, breaking the footer's own rhythm on
 * purpose. An address is exactly the kind of fact a visitor scans for rather
 * than reads, and everything above this point in the footer is the same
 * quiet sand tone — a band with real visual weight is what makes someone stop
 * scrolling here rather than past it.
 *
 * The head office gets one large map of its own, because a page is allowed
 * exactly one "here is where we are" moment before it turns into wallpaper;
 * every branch — that one again included — gets its own row beside it, which
 * is where the actual phone number lives. See BranchCard for why a row, not a
 * small map, is what the list itself is built from.
 */
export async function BranchesSection({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) return null;

  const [tFooter, tBranches, locale] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Branches"),
    getLocale(),
  ]);

  const main = branches.find((branch) => branch.is_main) ?? branches[0];
  const mainName = locale === "ar" ? main.name_ar : main.name_en;
  const mainPin =
    main.latitude && main.longitude ? { lat: main.latitude, lng: main.longitude } : null;

  return (
    <div className="border-t border-sand-200 bg-navy-950">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <Reveal>
          <SectionHeading
            eyebrow={tBranches("eyebrow")}
            title={tFooter("branchesTitle")}
            description={tBranches("sectionDescription")}
            tone="onDark"
          />
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[7fr_5fr] lg:gap-10 xl:grid-cols-[8fr_5fr]">
          {/* The main office, full size. `lg:sticky` keeps it in view as the
              list beside it scrolls — the one thing on the page worth staying
              on screen while everything else moves. */}
          <Reveal className="relative min-h-[20rem] overflow-hidden rounded-3xl border border-white/10 bg-navy-900 lg:sticky lg:top-24 lg:min-h-[32rem]">
            {mainPin ? (
              <>
                <iframe
                  src={mapEmbedSrc(mainPin.lat, mainPin.lng, locale)}
                  title={tBranches("mapTitle", { branch: mainName })}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 w-full border-0",
                    usesGoogleEmbed ? "top-0 h-full" : "-top-20 h-[calc(100%+10rem)]",
                  )}
                />

                {/* Same reasoning as BranchCard's own overlay: OSM's marker
                    param draws a fixed green pin it will not let a caller
                    recolour, so mapEmbedSrc leaves it out and this stands in
                    for it, in the site's own red rather than Google's default. */}
                {usesGoogleEmbed ? null : (
                  <PinIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-full fill-red-600 text-red-700 drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]"
                  />
                )}
              </>
            ) : (
              /* No pin on the record yet. A labelled placeholder is honest; a
                 map centred on a guess is not. */
              <div className="grid h-full place-items-center text-white/25">
                <MapIcon className="h-14 w-14" />
              </div>
            )}

            {/* The name reads over the map itself rather than beside it —
                this panel is the one large, unmistakable "here we are"
                moment the whole band is built around. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950 via-navy-950/70 to-transparent p-6 pt-20">
              <p className="text-lg font-bold text-white sm:text-xl">{mainName}</p>
            </div>
          </Reveal>

          {/* Every branch, head office included — the map beside it is a
              picture of the place; this is the list someone actually reads. */}
          <div className="flex flex-col gap-4">
            {branches.map((branch, index) => (
              <Reveal key={branch.id} delay={Math.min(index, 4) * 60}>
                <BranchCard branch={branch} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
