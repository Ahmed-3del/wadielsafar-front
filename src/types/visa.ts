export interface VisaCountry {
  id: number;
  name_ar: string;
  name_en: string;
  flag_image: string | null;
  is_active: boolean;
}

/** Blank means unlabelled: it answers to no specific purpose rather than
 *  being filed under a guessed one. */
export type VisaPurpose = "" | "TOURISM" | "BUSINESS" | "STUDY" | "UMRAH" | "OTHER";

export const VISA_PURPOSES: VisaPurpose[] = ["", "TOURISM", "BUSINESS", "STUDY", "UMRAH"];

export interface VisaType {
  id: number;
  country: VisaCountry;
  name_ar: string;
  name_en: string;
  purpose: VisaPurpose;
  requirements_ar: string;
  requirements_en: string;
  price: string;
  processing_time_days: number;
  validity_days: number | null;
}
