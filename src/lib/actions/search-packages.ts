"use server";

import { getPackages } from "@/lib/api/packages";
import type { Package } from "@/types/package";

/*
 * Lets the homepage's packages tab show real, matching packages the instant a
 * destination or a budget is chosen — see search-visas.ts for why this is a
 * Server Action rather than a client-side fetch straight to the API.
 */
export async function searchPackagesAction(
  destination: string,
  priceMax: string,
): Promise<Package[]> {
  if (!destination && !priceMax) return [];
  const response = await getPackages({
    destination: destination || undefined,
    price_max: priceMax ? Number(priceMax) : undefined,
    page_size: 12,
  });
  return response.results;
}
