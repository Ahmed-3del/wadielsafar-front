import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/*
 * Files uploaded through the panel are served by the API itself, so its origin
 * has to be allowed explicitly — next/image only permits https by default, and
 * in development the API is plain http on a non-standard port. Deriving this
 * from the same variable the API client uses means it stays correct when the
 * backend moves to its production hostname.
 */
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");
const isLocalApi = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(apiOrigin.hostname);

const nextConfig: NextConfig = {
  images: {
    /*
     * Next 16 refuses to optimize an image whose host resolves to a private
     * IP, which is an SSRF guard worth keeping. In development the API is
     * localhost, so uploaded media could never render without lifting it —
     * and it is lifted only there, and only when the API really is local.
     * A production build with a public API hostname keeps the protection.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" && isLocalApi,
    /*
     * Next 16 defaults this to [75] and silently coerces anything else to the
     * nearest allowed value — so a quality prop is ignored unless it is listed
     * here. The footer illustration is a wide field of soft sand gradients,
     * which is exactly what banding shows up in at 75.
     */
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: apiOrigin.protocol === "https:" ? "https" : "http",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port || undefined,
      },
      // Content editors also paste image URLs from a CDN, so the host isn't
      // known ahead of time. Before production launch this must be narrowed to
      // the actual CDN hostnames: a wildcard lets the image optimizer fetch and
      // re-serve any https URL on demand, which is both an open-proxy surface
      // and an uncapped optimization cost.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
