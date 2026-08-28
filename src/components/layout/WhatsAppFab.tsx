import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/utils/whatsapp";

/*
 * Persistent WhatsApp entry point on desktop. Deliberately a quiet floating
 * action rather than an auto-opening chat bubble: WhatsApp is how most Saudi
 * travel enquiries actually close, but a popup that interrupts reading costs
 * more than it wins.
 *
 * Hidden below lg, where the bottom tab bar carries WhatsApp in its centre
 * slot. Two floating WhatsApp targets on one small screen is one too many, and
 * this one would have had to dodge both the bar and the sticky price bars.
 */
export async function WhatsAppFab() {
  const t = await getTranslations("Whatsapp");

  return (
    <a
      href={whatsappLink(t("message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("cta")}
      className="whatsapp-fab group fixed bottom-5 z-40 hidden items-center gap-0 lg:inline-flex overflow-hidden rounded-full bg-whatsapp text-white shadow-lg transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-xl end-4 sm:end-6 sm:bottom-6"
      style={{ paddingInline: "0.9rem", height: "3.25rem" }}
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span className="max-w-0 whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 ease-out-soft group-hover:max-w-[16rem] group-hover:ps-2.5 group-hover:opacity-100 group-focus-visible:max-w-[16rem] group-focus-visible:ps-2.5 group-focus-visible:opacity-100 max-lg:hidden">
        {t("cta")}
      </span>
    </a>
  );
}
