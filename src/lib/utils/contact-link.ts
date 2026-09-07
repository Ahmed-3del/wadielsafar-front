import type { ServiceType } from "@/types/inquiry";

export interface ContactLinkParams {
  /** The entry of the contact form's list the form should open on. */
  service?: string | null;
  /** The wording the reader actually pressed, when it is finer than the
   *  service — "Travel insurance" under Other, or a package's own name. */
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

/** Narrow a value off the URL to a service the enquiry can be filed under. */
export function asServiceType(
  value: string | undefined,
  offered: readonly { value: ServiceType }[],
): ServiceType | null {
  if (!value) return null;
  // Only what the panel is offering: the query string is typed by anyone, and
  // an entry switched off is not on the list for a reason.
  return offered.find((row) => row.value === value)?.value ?? null;
}
