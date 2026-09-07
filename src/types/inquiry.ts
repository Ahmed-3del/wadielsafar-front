export type ServiceType =
  | "FLIGHT"
  | "HOTEL"
  | "PACKAGE"
  | "VISA"
  | "CRUISE"
  | "CORPORATE"
  | "OTHER";

export interface InquiryPayload {
  name: string;
  email: string;
  phone: string;
  service_type: ServiceType;
  /** Which of the Services screen's entries this came through, when it came
   *  through one. `service_type` stays the bucket it is filed under. */
  service?: number | null;
  destination: number | null;
  travel_date: string | null;
  message: string;
  source: string;
  /** Service-specific answers (route, dates, rooms…). Flat scalars only — the
   *  API rejects nested payloads on this public endpoint. */
  details?: Record<string, string | number | boolean | null>;
}

export interface Inquiry extends InquiryPayload {
  id: number;
  created_at: string;
}
