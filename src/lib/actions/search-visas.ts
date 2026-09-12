"use server";

import { getVisaTypes } from "@/lib/api/visas";
import type { VisaType } from "@/types/visa";

/*
 * Lets the homepage's visa tab show real, matching visas the instant a
 * country is chosen, without a page navigation — the widget's own submit
 * still carries the same two fields through to the request form, unchanged.
 *
 * A Server Action rather than a client-side fetch straight to the API: the
 * public API's CORS policy allows this site's own server, which is what every
 * other request in this app already goes through, not a fetch issued directly
 * from the visitor's browser to a different origin.
 */
export async function searchVisasAction(country: string, purpose: string): Promise<VisaType[]> {
  if (!country) return [];
  // The widget sends lowercase words; the model stores upper-case choices —
  // same conversion the /visas page itself applies to these two params.
  const response = await getVisaTypes({
    country,
    purpose: purpose ? purpose.toUpperCase() : undefined,
    page_size: 12,
  });
  return response.results;
}
