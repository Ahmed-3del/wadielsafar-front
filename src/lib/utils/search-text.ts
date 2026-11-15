/*
 * Folds text for matching, so a search finds what the reader meant rather
 * than only what they typed letter for letter.
 *
 * Arabic is the case that matters: almost nobody types the hamza on a
 * keyboard, so "افغانستان" has to find "أفغانستان" — it did not, and every
 * country starting with أ or إ looked missing until the hamza was typed. The
 * same goes for ة/ه and ى/ي at the end of a word, tashkeel, and the tatweel
 * stretch. Latin text is lower-cased and stripped of accents for the same
 * reason ("cote d'ivoire" finds "Côte d'Ivoire").
 */
export function foldForSearch(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // Latin accents
    .replace(/[ً-ٰٟـ]/g, "") // tashkeel, dagger alef, tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** True when every word of `query` appears somewhere in `haystack`, folded. */
export function matchesSearch(haystack: string, query: string): boolean {
  const target = foldForSearch(haystack);
  return foldForSearch(query)
    .split(" ")
    .filter(Boolean)
    .every((word) => target.includes(word));
}
