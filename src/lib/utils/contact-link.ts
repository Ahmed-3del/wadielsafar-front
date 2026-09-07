import type { ContactFormService } from "@/types/contact-form-service";
import { choiceId } from "@/types/contact-form-service";

export interface ContactLinkParams {
  /** Which entry of the contact form's list to open on. A service's slug, or
   *  one of the base service types. */
  service?: string | null;
  /** The wording the reader actually pressed, when it is finer than the
   *  service — a package's own name. */
  topic?: string | null;
  /** An offer's name, when the reader arrived by claiming it. */
  offer?: string | null;
  /** That offer's promo code, so the agent can apply it. */
  promo?: string | null;
}

/**
 * A link to the contact form that already knows what the reader came for.
 *
 * Pressing "Cruises" and then being asked what you need is the site forgetting
 * something it was just told. Every caller builds its link here rather than
 * writing the query string out, so the keys the pages write and the keys the
 * form reads cannot drift apart.
 */
export function contactHref(params: ContactLinkParams = {}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const text = value?.trim();
    if (text) query.set(key, text);
  }
  const search = query.toString();
  return search ? `/contact?${search}` : "/contact";
}

/**
 * Turn a `?service=` off the URL into the choice the form should open on.
 *
 * Matched on a service's slug first and then on a base type, so both
 * `/contact?service=travel-insurance` and `/contact?service=CRUISE` work — the
 * first is what a service tile links to, the second what a cruise page does.
 * Only what the panel is offering: the query string is typed by anyone, and an
 * entry switched off is not on the list for a reason.
 */
export function asFormChoice(
  value: string | undefined,
  offered: readonly ContactFormService[],
): string | null {
  if (!value) return null;
  const match =
    offered.find((entry) => entry.kind === "SERVICE" && entry.slug === value) ??
    offered.find((entry) => entry.kind === "TYPE" && entry.value === value);
  return match ? choiceId(match) : null;
}
