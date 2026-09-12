"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { BookingField, bookingControlClass } from "./BookingField";
import { AirportPicker } from "./LocationPicker";
import { CruiseRoutePicker } from "./CruiseRoutePicker";
import { Combobox, type ComboboxItem } from "@/components/ui/Combobox";
import {
  BedIcon,
  CalendarIcon,
  GlobeIcon,
  PassportIcon,
  PinIcon,
  ChevronForwardIcon,
  PlaneIcon,
  ShipIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { isBeforeIso, todayIso } from "@/lib/utils/dates";
import { budgetBandFor } from "@/features/package-discovery";
import type { Airport } from "@/types/airport";
import type { CruisePort } from "@/types/cruise";
import type { SearchTab } from "@/types/search";

export interface BookingOption {
  value: string;
  label: string;
  /** Second line in the dropdown — the country, usually. */
  description?: string;
}

interface BookingWidgetProps {
  destinations: BookingOption[];
  visaCountries: BookingOption[];
  /** Offered before the traveller types in the airport pickers. */
  popularAirports: Airport[];
  /** Every cruise port, which the country and port pickers are both built
   *  from. Empty hides the cruise route fields rather than offering two boxes
   *  with nothing in them. */
  cruisePorts: CruisePort[];
  /** Where most travellers here depart from, resolved from the catalogue so
   *  the field starts on a real airport rather than a bare city name. */
  defaultOrigin: string;
  /** Controlled by the homepage, which shows results for the open tab. Left
   *  out, the widget keeps its own tab — the visa and package pages use it
   *  that way. */
  tab?: SearchTab;
  onTabChange?: (tab: SearchTab) => void;
  /** Fires as soon as a real country (or purpose) is chosen on the visas tab
   *  — not on every keystroke, and not on free text that matched nothing —
   *  so the homepage can show matching visas immediately instead of waiting
   *  for "complete request" to be pressed. Empty country means "cleared". */
  onVisaFilterChange?: (filter: { country: string; purpose: string }) => void;
}

const TABS: { id: SearchTab; Icon: typeof PlaneIcon }[] = [
  { id: "flights", Icon: PlaneIcon },
  { id: "hotels", Icon: BedIcon },
  { id: "packages", Icon: GlobeIcon },
  { id: "visas", Icon: PassportIcon },
  { id: "cruises", Icon: ShipIcon },
];

const iconClass = "h-5 w-5";

function toItems(options: BookingOption[]): ComboboxItem[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
  }));
}

/*
 * The hero search. It deliberately does NOT imply live availability — Wadi Al
 * Safar sells curated trips, so submitting filters our own listings and carries
 * the traveller's dates through to the enquiry, rather than pretending to query
 * an airline GDS.
 *
 * Every place field is a searchable picker rather than a bare text box or a
 * native select: on a phone a native select is a full-screen roll of 176
 * airports with no way to type, and a text box accepts "dubaii" and sends an
 * agent chasing it.
 */
export function BookingWidget({
  destinations,
  visaCountries,
  popularAirports,
  cruisePorts,
  defaultOrigin,
  tab: controlledTab,
  onTabChange,
  onVisaFilterChange,
}: BookingWidgetProps) {
  const t = useTranslations("Booking");
  const tPicker = useTranslations("Picker");
  const tDates = useTranslations("Dates");
  const router = useRouter();
  // Uncontrolled unless the page asks to own the tab. Both modes go through
  // `setTab` so the rest of the component never has to know which is in play.
  const [ownTab, setOwnTab] = useState<SearchTab>("flights");
  const tab = controlledTab ?? ownTab;
  const setTab = (next: SearchTab) => {
    setOwnTab(next);
    onTabChange?.(next);
  };
  const [roundTrip, setRoundTrip] = useState(true);

  // Held here rather than inside the form, which is remounted on every tab
  // change: a traveller who checks the packages tab and comes back should not
  // have to retype where they are flying from.
  const [origin, setOrigin] = useState(defaultOrigin);
  const [arrival, setArrival] = useState("");
  const [destination, setDestination] = useState("");
  const [visaCountry, setVisaCountry] = useState("");
  const [visaPurpose, setVisaPurpose] = useState("");
  // The last *confirmed* country — a real pick from the list, never the raw
  // text of a free-typed search that matched nothing. That distinction only
  // matters for the live filter: the form field below still submits whatever
  // was typed, same as before.
  const [visaFilterCountry, setVisaFilterCountry] = useState("");
  // Country first, then one of its ports — the cruise search's two halves.
  const [cruiseCountry, setCruiseCountry] = useState("");
  const [cruisePort, setCruisePort] = useState("");

  /* Dates are held here rather than left to the DOM because the return field's
     floor is the departure the traveller just chose, and a bare `min={today}`
     cannot express that. */
  const [depart, setDepart] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const today = todayIso();

  /** Clears a later date that the newly chosen earlier one has invalidated. */
  function setStart(value: string, end: string, setEnd: (next: string) => void) {
    setDateError(null);
    if (end && isBeforeIso(end, value)) setEnd("");
  }

  const destinationItems = toItems(destinations);
  const visaItems = toItems(visaCountries);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    /* The `min` attributes stop this in the native picker, but a typed date
       walks straight past them — and this form navigates rather than posting,
       so nothing downstream would catch it either. */
    const pairs: [string, string, string][] = [
      [String(data.get("depart") ?? ""), String(data.get("return") ?? ""), t("depart")],
      [String(data.get("checkIn") ?? ""), String(data.get("checkOut") ?? ""), t("checkIn")],
    ];
    for (const [start, end, label] of pairs) {
      if (start && isBeforeIso(start, today)) {
        setDateError(tDates("past"));
        return;
      }
      if (start && end && isBeforeIso(end, start)) {
        setDateError(tDates("notBefore", { field: label }));
        return;
      }
    }
    setDateError(null);

    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }

    /*
     * A package search has no listing worth landing on that the homepage has
     * not already shown: the results sit under this widget. What it needs next
     * is a quote, and the planner is the form that produces one — it asks for
     * exactly what was collected here, so nothing is typed twice.
     */
    if (tab === "packages") {
      const plan = new URLSearchParams();
      const destination = params.get("destination");
      const priceMax = params.get("price_max");
      const depart = params.get("depart");
      if (destination) plan.set("destination", destination);
      if (depart) plan.set("travel_date", depart);
      if (priceMax) plan.set("budget", budgetBandFor(Number(priceMax)));
      const planQuery = plan.toString();
      router.push(`/packages/plan${planQuery ? `?${planQuery}` : ""}`);
      return;
    }

    const query = params.toString();
    router.push(`/${tab}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="w-full">
      {/* All five services visible at once. They used to scroll sideways, which
          hid "cruises" off the edge of a phone — the one tab a reader would
          never think to look for, because nothing said it was there. Wrapping
          costs one extra row and shows the whole offer. */}
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="flex flex-wrap justify-center gap-2 pb-3 sm:justify-start"
      >
        {TABS.map(({ id, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { setTab(id); }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-4",
                active
                  ? "bg-white text-navy-900 shadow-md"
                  : "bg-white/10 text-white/90 hover:bg-white/20",
              )}
            >
              {/* The icon carries the selection too, not just the pill behind
                  it — on a phone the tab strip scrolls, and colour reads at a
                  glance where a background change does not. */}
              <Icon
                className={cn(
                  iconClass,
                  "transition-all duration-200 ease-out-soft",
                  // Hidden on the narrowest phones, where the five tabs
                  // otherwise take three rows. The pill behind the label still
                  // marks the open tab; the icon is the second signal, and the
                  // row it costs is worth more at 320px.
                  "max-[359px]:hidden",
                  active && "scale-110 text-gold-600",
                )}
              />
              {t(`tabs.${id}`)}
            </button>
          );
        })}
      </div>

      {/* noValidate so the guard in handleSubmit is what runs. Left to the
          browser, an out-of-range date is refused with a native tooltip in the
          browser's language rather than the site's — an Arabic visitor on an
          English-configured phone gets an English error on an Arabic form. */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl bg-white p-2 shadow-xl sm:p-3"
        key={tab}
      >
        {tab === "flights" ? (
          <div className="flex flex-wrap gap-2 px-2 pb-1 pt-2">
            {([true, false] as const).map((isRound) => (
              <button
                key={String(isRound)}
                type="button"
                onClick={() => { setRoundTrip(isRound); }}
                aria-pressed={roundTrip === isRound}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                  roundTrip === isRound
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-sand-200 text-sand-600 hover:border-navy-300",
                )}
              >
                {t(isRound ? "roundTrip" : "oneWay")}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex flex-col divide-y divide-sand-200 lg:flex-row lg:items-stretch lg:divide-x lg:divide-y-0 lg:rtl:divide-x-reverse">
          {tab === "flights" ? (
            <>
              <BookingField label={t("from")} icon={<PlaneIcon className={iconClass} />}>
                <AirportPicker
                  name="from"
                  variant="widget"
                  value={origin}
                  onChange={setOrigin}
                  popular={popularAirports}
                />
              </BookingField>
              <BookingField label={t("to")} icon={<PinIcon className={iconClass} />}>
                <AirportPicker
                  name="search"
                  variant="widget"
                  value={arrival}
                  onChange={setArrival}
                  popular={popularAirports}
                  placeholder={t("toPlaceholder")}
                />
              </BookingField>
              <BookingField label={t("depart")} icon={<CalendarIcon className={iconClass} />}>
                <input
                  type="date"
                  name="depart"
                  min={today}
                  value={depart}
                  onChange={(event) => {
                    setDepart(event.target.value);
                    setStart(event.target.value, returnDate, setReturnDate);
                  }}
                  className={bookingControlClass}
                />
              </BookingField>
              {roundTrip ? (
                <BookingField label={t("return")} icon={<CalendarIcon className={iconClass} />}>
                  <input
                    type="date"
                    name="return"
                    // The departure once there is one, today until then.
                    min={depart || today}
                    value={returnDate}
                    onChange={(event) => {
                      setReturnDate(event.target.value);
                      setDateError(null);
                    }}
                    className={bookingControlClass}
                  />
                </BookingField>
              ) : null}
              <BookingField label={t("travellers")} icon={<UsersIcon className={iconClass} />}>
                <select name="pax" className={bookingControlClass} defaultValue="1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {t("travellerCount", { count: n })}
                    </option>
                  ))}
                </select>
              </BookingField>
            </>
          ) : null}

          {tab === "hotels" ? (
            <>
              <BookingField label={t("destination")} icon={<PinIcon className={iconClass} />}>
                <Combobox
                  name="destination"
                  variant="widget"
                  value={destination}
                  onChange={setDestination}
                  items={destinationItems}
                  placeholder={t("anyDestination")}
                  labels={{
                    listbox: tPicker("destinationListbox"),
                    empty: tPicker("empty"),
                    loading: tPicker("loading"),
                  }}
                />
              </BookingField>
              <BookingField label={t("checkIn")} icon={<CalendarIcon className={iconClass} />}>
                <input
                  type="date"
                  name="checkIn"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    setStart(event.target.value, checkOut, setCheckOut);
                  }}
                  className={bookingControlClass}
                />
              </BookingField>
              <BookingField label={t("checkOut")} icon={<CalendarIcon className={iconClass} />}>
                <input
                  type="date"
                  name="checkOut"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    setDateError(null);
                  }}
                  className={bookingControlClass}
                />
              </BookingField>
              <BookingField label={t("guests")} icon={<UsersIcon className={iconClass} />}>
                <select name="guests" className={bookingControlClass} defaultValue="2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {t("guestCount", { count: n })}
                    </option>
                  ))}
                </select>
              </BookingField>
            </>
          ) : null}

          {tab === "packages" ? (
            <>
              <BookingField label={t("destination")} icon={<PinIcon className={iconClass} />}>
                <Combobox
                  name="destination"
                  variant="widget"
                  value={destination}
                  onChange={setDestination}
                  items={destinationItems}
                  placeholder={t("anyDestination")}
                  labels={{
                    listbox: tPicker("destinationListbox"),
                    empty: tPicker("empty"),
                    loading: tPicker("loading"),
                  }}
                />
              </BookingField>
              <BookingField label={t("budget")} icon={<GlobeIcon className={iconClass} />}>
                <select name="price_max" className={bookingControlClass} defaultValue="">
                  <option value="">{t("anyBudget")}</option>
                  {[5000, 10000, 20000].map((v) => (
                    <option key={v} value={v}>
                      {t("upTo", { amount: v.toLocaleString("en-US") })}
                    </option>
                  ))}
                </select>
              </BookingField>
              <BookingField label={t("depart")} icon={<CalendarIcon className={iconClass} />}>
                <input type="date" name="depart" min={today} className={bookingControlClass} />
              </BookingField>
            </>
          ) : null}

          {tab === "visas" ? (
            <>
              <BookingField label={t("visaDestination")} icon={<PinIcon className={iconClass} />}>
                <Combobox
                  name="country"
                  variant="widget"
                  value={visaCountry}
                  onChange={(value, item) => {
                    setVisaCountry(value);
                    // Only a genuine pick from the list narrows the results
                    // below — free text that matched nothing is not a country
                    // id the API filter could use.
                    const confirmed = item ? value : "";
                    setVisaFilterCountry(confirmed);
                    onVisaFilterChange?.({ country: confirmed, purpose: visaPurpose });
                  }}
                  items={visaItems}
                  placeholder={t("chooseCountry")}
                  labels={{
                    listbox: tPicker("countryListbox"),
                    empty: tPicker("empty"),
                    loading: tPicker("loading"),
                  }}
                />
              </BookingField>
              <BookingField label={t("visaFor")} icon={<PassportIcon className={iconClass} />}>
                <select
                  name="purpose"
                  className={bookingControlClass}
                  value={visaPurpose}
                  onChange={(event) => {
                    const value = event.target.value;
                    setVisaPurpose(value);
                    onVisaFilterChange?.({ country: visaFilterCountry, purpose: value });
                  }}
                >
                  <option value="">{t("anyVisaType")}</option>
                  {(["tourism", "business", "study"] as const).map((p) => (
                    <option key={p} value={p}>
                      {t(`visaPurposes.${p}`)}
                    </option>
                  ))}
                </select>
              </BookingField>
            </>
          ) : null}

          {tab === "cruises" ? (
            <>
              <CruiseRoutePicker
                ports={cruisePorts}
                country={cruiseCountry}
                onCountryChange={setCruiseCountry}
                port={cruisePort}
                onPortChange={setCruisePort}
              />
              <BookingField label={t("leaving")} icon={<CalendarIcon className={iconClass} />}>
                <input type="date" name="depart" min={today} className={bookingControlClass} />
              </BookingField>
            </>
          ) : null}

          <div className="p-2 lg:flex lg:items-center lg:ps-3">
            {/* An arrow, not a magnifier: this button does not search an
                inventory, it carries what has been filled in through to the
                request form an agent answers. */}
            <Button type="submit" size="lg" className="w-full lg:w-auto">
              {t("search")}
              <ChevronForwardIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Button>
          </div>
        </div>
      </form>

      {dateError ? (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-danger-600/95 px-4 py-2.5 text-sm font-medium text-white"
        >
          {dateError}
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs text-white/70 lg:text-start">{t("disclaimer")}</p>
    </div>
  );
}
