import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/*
 * Lets the site be installed to a phone's home screen and run without browser
 * chrome. Arabic first, because that is what the site defaults to and what an
 * installed icon should open into.
 *
 * `start_url` carries the locale prefix: the bare "/" only redirects, and an
 * installed app that begins with a redirect wastes its first paint.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.legalNameAr,
    short_name: siteConfig.nameAr,
    description: siteConfig.descriptionAr,
    lang: "ar",
    dir: "rtl",
    start_url: "/ar",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    // Matches the header, so the status bar continues the page rather than
    // sitting on a strip of some other colour.
    theme_color: "#ffffff",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
