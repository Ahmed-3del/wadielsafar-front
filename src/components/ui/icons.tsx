import type { SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Inline single-path icons. Kept local rather than pulling an icon package: the
 * site needs about a dozen, and shipping a library for that costs more bytes
 * than the whole set.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlaneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </Base>
);

/*
 * Solid, side-on and nose-forward — the marker that rides the navigation beam
 * and orbits the loading mark. Filled rather than stroked because it is drawn
 * at 14-20px where a 1.75px outline turns into a smudge, and mirrored in RTL so
 * it always points the way the page is moving.
 */
export const PlaneMarkIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...p}>
    {/* The mirror lives on an inner group so it is independent of whatever
        positioning classes a caller puts on the <svg> itself — this icon is
        centred with translate utilities in some places and offset in others. */}
    <g className="plane-mark-flip">
      <g transform="rotate(90 12 12)">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </g>
    </g>
  </svg>
);

export const BedIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 18v-7m0 0V7m0 4h18v7m0-7a3 3 0 0 0-3-3h-5v3" />
    <circle cx="7.5" cy="10.5" r="1.5" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18-2.5-2.6-2.5-15.4 0-18Z" />
  </Base>
);

export const PassportIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <circle cx="11.5" cy="10" r="2.5" />
    <path d="M9 15.5h5" />
  </Base>
);

export const ShipIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 17.5c1.6 0 1.6 1.5 3.2 1.5s1.6-1.5 3.2-1.5 1.6 1.5 3.2 1.5 1.6-1.5 3.2-1.5 1.6 1.5 3.2 1.5" />
    <path d="M5 14V9h14v5l-7 2.5z" />
    <path d="M9 9V5h6v4" />
  </Base>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-4.6v-6.1H9.1V21H4.5a1 1 0 0 1-1-1z" />
  </Base>
);

export const BagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8.5h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a1 1 0 0 1 1-1z" />
    <path d="M9 8.5v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" />
  </Base>
);

export const CarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 17h14M6.5 17v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V17m14 0v1.5a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1V17" />
    <path d="M3.5 13.5 5 8.2A2 2 0 0 1 6.9 6.8h10.2A2 2 0 0 1 19 8.2l1.5 5.3v2a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
    <path d="M3.9 13.5h16.2" />
  </Base>
);

export const MealIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3v7a2.5 2.5 0 0 0 5 0V3M8.5 12.5V21" />
    <path d="M17.5 3c-1.4 1.2-2 3-2 5.2 0 1.6.7 2.6 2 2.9V21" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);

export const CalendarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
);

export const UsersIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M16 11.2A3 3 0 0 0 16 5.4M18 19.5a5 5 0 0 0-2.5-4.3" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const MinusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" strokeWidth="2.25" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" strokeWidth="2.25" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);

export const HeadsetIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <path d="M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1z" />
  </Base>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Base>
);

/*
 * Social marks. Filled rather than stroked, because these are logos with fixed
 * shapes — outlining them at 18px turns each one into a smudge.
 */
const Solid = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
  </Solid>
);

export const YoutubeIcon = (p: IconProps) => (
  <Solid {...p}>
    {/* evenodd so the play triangle stays a hole in the rounded rectangle
        rather than disappearing into it. */}
    <path
      fillRule="evenodd"
      d="M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z"
    />
  </Solid>
);

export const LinkedinIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm6.5 0h3.83v1.5h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.12v5.46h-4v-4.84c0-1.15-.02-2.64-1.6-2.64-1.61 0-1.86 1.26-1.86 2.56v4.92h-4v-11z" />
  </Solid>
);

export const XIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M17.53 3h3.05l-6.66 7.61L21.75 21h-6.13l-4.8-6.28L5.32 21H2.26l7.12-8.14L2.25 3h6.29l4.34 5.74L17.53 3zm-1.07 16.17h1.69L7.62 4.73H5.8l10.66 14.44z" />
  </Solid>
);

export const InstagramIcon = (p: IconProps) => (
  <Solid {...p}>
    {/* evenodd, so the camera body and the lens read as rings rather than
        filling in as one solid square. */}
    <path
      fillRule="evenodd"
      d="M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6zm0 1.9A4.1 4.1 0 0 0 3.9 8v8A4.1 4.1 0 0 0 8 20.1h8a4.1 4.1 0 0 0 4.1-4.1V8A4.1 4.1 0 0 0 16 3.9H8zm4 3.1a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.4-3a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z"
    />
  </Solid>
);

export const TiktokIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-4.66 1.55 2.59 2.59 0 0 1 3.3-3.84v-3.2a5.72 5.72 0 1 0 4.45 5.57V9.01a7.35 7.35 0 0 0 4.28 1.37V7.3a4.29 4.29 0 0 1-2.22-1.48z" />
  </Solid>
);

export const SnapchatIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M12 2.5c2.6 0 4.4 1.9 4.53 4.5.04.79 0 1.53-.03 2.13.29.11.66.09 1.1-.13.2-.1.44-.13.66-.06.44.13.7.5.66.9-.05.44-.4.72-.87.93-.2.09-.5.19-.79.29-.5.17-.79.4-.7.83.19.9 1.6 2.63 3.15 2.9.32.06.53.33.5.65-.04.5-.66.83-1.9 1.06-.15.03-.28.2-.34.5-.05.24-.1.5-.2.72-.09.2-.25.3-.53.3-.28 0-.63-.07-1.05-.13a4.6 4.6 0 0 0-2.2.12c-.45.17-.85.5-1.3.85-.6.47-1.24.96-2.19.96s-1.6-.5-2.2-.96c-.44-.35-.84-.68-1.3-.85a4.6 4.6 0 0 0-2.19-.12c-.42.06-.77.13-1.05.13-.28 0-.44-.1-.53-.3-.1-.22-.15-.48-.2-.72-.06-.3-.19-.47-.34-.5-1.24-.23-1.86-.56-1.9-1.06a.57.57 0 0 1 .5-.65c1.55-.27 2.96-2 3.15-2.9.09-.43-.2-.66-.7-.83-.29-.1-.59-.2-.79-.29-.47-.21-.82-.49-.87-.93-.04-.4.22-.77.66-.9a.9.9 0 0 1 .66.06c.44.22.81.24 1.1.13-.03-.6-.07-1.34-.03-2.13C7.6 4.4 9.4 2.5 12 2.5z" />
  </Solid>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6.5h17v11h-17z" />
    <path d="m3.5 7.5 8.5 6 8.5-6" />
  </Base>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

/*
 * Directional chevrons.
 *
 * ChevronForward points along the reading direction — right in LTR, left in
 * RTL — and bakes the flip in so call sites cannot get it backwards. That is
 * exactly the mistake this replaces: a left-pointing path used as the base,
 * which rendered backwards in *both* locales.
 *
 * ChevronPrev/ChevronNext are for paired controls (carousels, calendars) whose
 * flex container already reverses under RTL; they flip too, so the glyph keeps
 * matching the side it lands on.
 */
export const ChevronForwardIcon = ({ className, ...p }: IconProps) => (
  <Base className={cn("rtl:rotate-180", className)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
);

export const ChevronPrevIcon = ({ className, ...p }: IconProps) => (
  <Base className={cn("rtl:rotate-180", className)} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Base>
);

export const ChevronNextIcon = ({ className, ...p }: IconProps) => (
  <Base className={cn("rtl:rotate-180", className)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
);
