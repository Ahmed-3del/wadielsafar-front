/*
 * How wide a card is inside a Rail.
 *
 * 85vw leaves about 25-45px of the next card showing on a phone — enough to
 * say "this scrolls", not enough to render half a headline at the screen edge,
 * which reads as a broken layout rather than an invitation.
 *
 * It lives in a module of its own rather than in Rail.tsx because Rail is a
 * client component: Next hands a Server Component a client *reference* for
 * anything exported from a "use client" module, so a string constant imported
 * from there arrives as an object, `cn` drops it, and the cards collapse to
 * their content width. This module has no directive, so both sides get the
 * string.
 *
 * Exported rather than applied inside Rail because callers own their children:
 * a row of small service tiles has its own width and must not take this one.
 */
export const railCardClass = "w-[85vw] shrink-0 snap-start sm:w-72 lg:w-80";
