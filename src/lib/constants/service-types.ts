import type { ServiceType } from "@/types/inquiry";

// Mirrors the backend's service_type choices verbatim (see InquiryPayload).
export const SERVICE_TYPES: ServiceType[] = [
  "FLIGHT",
  "HOTEL",
  "PACKAGE",
  "VISA",
  "CRUISE",
  "CORPORATE",
  "OTHER",
];
