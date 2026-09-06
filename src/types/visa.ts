export interface VisaCountry {
  id: number;
  name_ar: string;
  name_en: string;
  flag_image: string | null;
  /** A photograph of the country, shared by every visa card it issues. */
  cover_image: string | null;
  is_active: boolean;
}

/** Blank means unlabelled: it answers to no specific purpose rather than
 *  being filed under a guessed one. */
export type VisaPurpose = "" | "TOURISM" | "BUSINESS" | "STUDY" | "UMRAH" | "OTHER";

export const VISA_PURPOSES: VisaPurpose[] = ["", "TOURISM", "BUSINESS", "STUDY", "UMRAH"];

/** How many times the visa lets you in. Blank where it varies by applicant —
 *  stating one when the embassy decides case by case would be a guess. */
export type VisaEntry = "" | "SINGLE" | "MULTIPLE";

export interface VisaType {
  id: number;
  country: VisaCountry;
  name_ar: string;
  name_en: string;
  purpose: VisaPurpose;
  entry_type: VisaEntry;
  /** Overrides the country's photo for this one visa. */
  cover_image: string | null;
  requirements_ar: string;
  requirements_en: string;
  price: string;
  processing_time_days: number;
  validity_days: number | null;
}
