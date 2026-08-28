import type { ServiceType } from "@/types/inquiry";

/* Keys are unions rather than plain strings so next-intl's strict message-key
 * typing can verify every label at build time instead of failing at runtime. */
export type RequestLabelKey =
  | "tripType" | "cabinClass" | "from" | "to" | "depart" | "return" | "passengers"
  | "city" | "stars" | "checkIn" | "checkOut" | "rooms" | "guests"
  | "travellers" | "travellersCount" | "travelDate" | "name" | "phone" | "email" | "notes"
  | "cityPlaceholder" | "destination" | "nights" | "hotelLevel" | "services"
  | "budget" | "destinationPlaceholder";

export type RequestOptionKey =
  | "roundTrip" | "oneWay" | "anyStars" | "anyBudget"
  | "cabin.ECONOMY" | "cabin.PREMIUM_ECONOMY" | "cabin.BUSINESS" | "cabin.FIRST"
  | "hotelLevels.3" | "hotelLevels.4" | "hotelLevels.5" | "hotelLevels.any"
  | "budgets.under5k" | "budgets.5to10k" | "budgets.10to20k" | "budgets.over20k"
  | "services.flights" | "services.hotel" | "services.transfers"
  | "services.tours" | "services.visa" | "services.insurance" | "services.meals";

/* Optional section headings inside a long form. Only the planner uses them so
 * far; every other request form is short enough to read as one block. */
export type RequestGroupKey = "trip" | "style" | "services";

export interface SelectOption {
  value: string;
  /** A message key in the request form namespace, or a bare numeric label. */
  label: RequestOptionKey | `${number}`;
}

export interface RequestFieldDef {
  name: string;
  /** Key inside the "RequestForm" message namespace. */
  labelKey: RequestLabelKey;
  // "checkbox" renders a multi-select group. Its value reaches the API as a
  // joined string, not an array: the inquiry `details` field accepts flat
  // scalars only.
  //
  // "stepper" and "segmented" are selects by another name — they carry the
  // same string values, but a count is faster to set with two buttons than a
  // dropdown, and a short option set is faster to read laid out than rolled up.
  //
  // "airport" and "city" are the same searchable picker over the airport
  // catalogue; "airport" keeps the IATA code in the answer because a flight
  // question needs it, "city" drops it because a hotel question does not.
  // Both still accept a typed answer: a gap in reference data must not cost an
  // enquiry.
  type:
    | "text"
    | "date"
    | "select"
    | "textarea"
    | "checkbox"
    | "stepper"
    | "segmented"
    | "airport"
    | "city";
  /** Bounds for a stepper. Its value stays a string, like every other field. */
  min?: number;
  max?: number;
  /** Date fields: refuse anything before today. A trip that starts yesterday
   *  is a typo, and it reaches an agent as a booking nobody can fulfil. */
  notPast?: boolean;
  /** Date fields: refuse anything earlier than this other field's value. A
   *  return cannot precede its departure, nor a check-out its check-in. */
  notBefore?: string;
  required?: boolean;
  options?: SelectOption[];
  placeholderKey?: RequestLabelKey;
  /** Full width on the two-column desktop grid. */
  wide?: boolean;
  /** Only render when another field has this value (e.g. return date). */
  showWhen?: { field: string; equals: string };
  /** Groups consecutive fields under a heading. Omit for an ungrouped form. */
  group?: RequestGroupKey;
}

/*
 * Field definitions per service. These are request forms, not searches: Wadi Al
 * Safar has no live inventory, so the job is to capture exactly what an agent
 * needs to quote and then hand off to a human.
 */
export const FLIGHT_FIELDS: RequestFieldDef[] = [
  {
    name: "trip_type",
    labelKey: "tripType",
    type: "segmented",
    required: true,
    options: [
      { value: "ROUND_TRIP", label: "roundTrip" },
      { value: "ONE_WAY", label: "oneWay" },
    ],
  },
  {
    name: "cabin_class",
    labelKey: "cabinClass",
    type: "select",
    options: [
      { value: "ECONOMY", label: "cabin.ECONOMY" },
      { value: "PREMIUM_ECONOMY", label: "cabin.PREMIUM_ECONOMY" },
      { value: "BUSINESS", label: "cabin.BUSINESS" },
      { value: "FIRST", label: "cabin.FIRST" },
    ],
  },
  { name: "from", labelKey: "from", type: "airport", required: true },
  { name: "to", labelKey: "to", type: "airport", required: true },
  { name: "depart", labelKey: "depart", type: "date", required: true, notPast: true },
  {
    name: "return",
    labelKey: "return",
    type: "date",
    notPast: true,
    notBefore: "depart",
    showWhen: { field: "trip_type", equals: "ROUND_TRIP" },
  },
  { name: "passengers", labelKey: "passengers", type: "stepper", min: 1, max: 9 },
];

export const HOTEL_FIELDS: RequestFieldDef[] = [
  { name: "city", labelKey: "city", type: "city", required: true },
  {
    name: "stars",
    labelKey: "stars",
    type: "segmented",
    options: [
      { value: "", label: "anyStars" },
      ...[5, 4, 3].map((n) => ({ value: String(n), label: String(n) as `${number}` })),
    ],
  },
  { name: "check_in", labelKey: "checkIn", type: "date", required: true, notPast: true },
  {
    name: "check_out",
    labelKey: "checkOut",
    type: "date",
    required: true,
    notPast: true,
    notBefore: "check_in",
  },
  { name: "rooms", labelKey: "rooms", type: "stepper", min: 1, max: 6 },
  { name: "guests", labelKey: "guests", type: "stepper", min: 1, max: 9 },
];

export const VISA_FIELDS: RequestFieldDef[] = [
  { name: "travellers", labelKey: "travellers", type: "stepper", min: 1, max: 9 },
  { name: "travel_date", labelKey: "travelDate", type: "date", notPast: true },
];

export const SERVICE_FIELDS: Partial<Record<ServiceType, RequestFieldDef[]>> = {
  FLIGHT: FLIGHT_FIELDS,
  HOTEL: HOTEL_FIELDS,
  VISA: VISA_FIELDS,
};

/*
 * "Plan your own trip" — for travellers whose trip is not one of the ready-made
 * packages. It asks only what an agent needs to price a custom itinerary, and
 * nothing that would be guesswork at this stage.
 */
export const PACKAGE_PLAN_FIELDS: RequestFieldDef[] = [
  {
    name: "destination",
    labelKey: "destination",
    type: "city",
    required: true,
    group: "trip",
  },
  { name: "travel_date", labelKey: "travelDate", type: "date", notPast: true, group: "trip" },
  { name: "nights", labelKey: "nights", type: "stepper", min: 1, max: 21, group: "trip" },
  {
    name: "travellers",
    labelKey: "travellersCount",
    type: "stepper",
    min: 1,
    max: 12,
    group: "trip",
  },
  {
    name: "hotel_level",
    labelKey: "hotelLevel",
    type: "segmented",
    group: "style",
    options: [
      { value: "", label: "hotelLevels.any" },
      { value: "5", label: "hotelLevels.5" },
      { value: "4", label: "hotelLevels.4" },
      { value: "3", label: "hotelLevels.3" },
    ],
  },
  {
    name: "budget",
    labelKey: "budget",
    type: "select",
    group: "style",
    options: [
      { value: "", label: "anyBudget" },
      { value: "under5k", label: "budgets.under5k" },
      { value: "5to10k", label: "budgets.5to10k" },
      { value: "10to20k", label: "budgets.10to20k" },
      { value: "over20k", label: "budgets.over20k" },
    ],
  },
  {
    name: "services",
    labelKey: "services",
    type: "checkbox",
    wide: true,
    group: "services",
    options: [
      { value: "flights", label: "services.flights" },
      { value: "hotel", label: "services.hotel" },
      { value: "transfers", label: "services.transfers" },
      { value: "tours", label: "services.tours" },
      { value: "visa", label: "services.visa" },
      { value: "insurance", label: "services.insurance" },
      { value: "meals", label: "services.meals" },
    ],
  },
];
