/*
 * Map URLs for the branch cards.
 *
 * The embedded preview prefers Google's Embed API, which needs a key. Until
 * one is configured the preview falls back to OpenStreetMap, which needs none
 * — a branch card with a real map beats one with an empty grey box, and the
 * switch is a single environment variable when the key exists.
 *
 * The "view on map" link is always Google Maps: it is what phones in Saudi
 * open, and it hands the address straight to the navigation app.
 */
const GOOGLE_EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? "";

export const usesGoogleEmbed = GOOGLE_EMBED_KEY.length > 0;

/** Roughly a 400m box around the pin — close enough to recognise the street. */
const SPAN = 0.004;

export function mapEmbedSrc(lat: string, lng: string, locale: string): string {
  if (usesGoogleEmbed) {
    const query = encodeURIComponent(`${lat},${lng}`);
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_EMBED_KEY}&q=${query}&zoom=15&language=${locale}`;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const bbox = [
    longitude - SPAN,
    latitude - SPAN,
    longitude + SPAN,
    latitude + SPAN,
  ].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

/*
 * A branch's own Share link when one is set — the only way "view on map" can
 * open its real listing, with its own name, photo and rating, rather than a
 * generic result. Otherwise a name-and-address search: Google resolves that
 * to the matching indexed business the same way typing it into Maps by hand
 * would, which a bare "lat,lng" query never does — that only ever drops an
 * anonymous pin labelled with the coordinates themselves.
 */
export function mapSearchUrl(name: string, address: string, googleMapsUrl: string): string {
  if (googleMapsUrl) return googleMapsUrl;
  const query = address ? `${name}, ${address}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
