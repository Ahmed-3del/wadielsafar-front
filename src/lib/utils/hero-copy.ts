import type { PageHero } from "@/types/page-hero";

interface HeroCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/*
 * Merges an editor's hero copy over the page's own translated strings, field by
 * field. Blank stays blank-and-falls-back rather than overriding, so an editor
 * can change a background image without being forced to re-enter the headline
 * in both languages — the commonest reason CMS-driven heroes end up with a
 * missing or untranslated title.
 */
export function heroCopy(
  hero: PageHero | null,
  isArabic: boolean,
  fallback: HeroCopy,
): HeroCopy {
  if (!hero) return fallback;

  const pick = (ar: string, en: string, fallbackValue: string) => {
    const value = (isArabic ? ar : en).trim();
    return value || fallbackValue;
  };

  return {
    eyebrow: pick(hero.eyebrow_ar, hero.eyebrow_en, fallback.eyebrow),
    title: pick(hero.title_ar, hero.title_en, fallback.title),
    subtitle: pick(hero.subtitle_ar, hero.subtitle_en, fallback.subtitle),
  };
}
