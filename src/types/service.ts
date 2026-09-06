export interface Service {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  /** Icon key, not a URL — one of the backend's ServiceIconChoices, which the
   *  tiles map to a local component. */
  icon: string;
  /** Where the tile leads, as a site-relative path. Empty means the contact
   *  form, which is the right answer for an add-on an agent arranges. */
  link: string;
  image: string | null;
  order: number;
  is_active: boolean;
}
