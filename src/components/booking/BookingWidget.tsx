"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  CloseIcon,
  SearchIcon,
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
  /*
   * Each of these fires as soon as a field that actually narrows a search on
   * the homepage changes — not on every keystroke, and not on free text that
   * matched nothing — so the results below can update immediately instead of
   * waiting for "complete request" to be pressed. An empty value in any of
   * them means "cleared", not "unset the whole filter": whichever fields are
   * still filled keep narrowing the results.
   *
   * Not every field on every tab can drive this: hotel and flight dates have
   * no matching filter on the catalogue itself (see search-hotels.ts and
   * search-flights.ts), so only the fields the API can actually answer are
   * wired up here.
   */
  onVisaFilterChange?: (filter: { country: string; purpose: string }) => void;
  onPackagesFilterChange?: (filter: { destination: string; priceMax: string }) => void;
  onHotelsFilterChange?: (filter: { destination: string }) => void;
  onCruisesFilterChange?: (filter: { country: string; port: string; departAfter: string }) => void;
  onFlightsFilterChange?: (filter: { originCode: string; destinationCode: string }) => void;
  /** True while the homepage has pinned the widget under the header on a
   *  phone. Drops the small print, which is not worth screen height on a bar
   *  that stays in view the whole way down the page. */
  stuck?: boolean;
}

const TABS: { id: SearchTab; Icon: typeof PlaneIcon }[] = [
  { id: "packages", Icon: GlobeIcon },
  { id: "visas", Icon: PassportIcon },
  { id: "cruises", Icon: ShipIcon },
  { id: "hotels", Icon: BedIcon },
  { id: "flights", Icon: PlaneIcon },
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
  onPackagesFilterChange,
  onHotelsFilterChange,
  onCruisesFilterChange,
  onFlightsFilterChange,
  stuck = false,
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
  // The last *confirmed* airport codes — a real pick from the list, never the
  // raw text of a free-typed search that matched nothing. Only these drive
  // the live filter; the fields above still submit whatever was typed.
  const [originCode, setOriginCode] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [destination, setDestination] = useState("");
  const [packagesBudget, setPackagesBudget] = useState("");
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
  const [cruiseDepart, setCruiseDepart] = useState("");

  /* Dates are held here rather than left to the DOM because the return field's
     floor is the departure the traveller just chose, and a bare `min={today}`
     cannot express that. */
  const [depart, setDepart] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  /*
   * One effect per tab that can narrow a search, notifying the homepage
   * whenever that tab's own filter state settles — rather than a call inlined
   * into each field's own onChange. Cruises is why: choosing a country there
   * also clears the port in the same tick (see CruiseRoutePicker), and a
   * notification built inline from this render's other field values would
   * have carried the port's *old* country alongside it, since React had not
   * yet re-rendered with the country's own update. An effect only ever reads
   * state after both updates have landed, so it cannot see that half-applied
   * moment.
   */
  useEffect(() => {
    onVisaFilterChange?.({ country: visaFilterCountry, purpose: visaPurpose });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onVisaFilterChange is the parent's setState setter, stable across renders.
  }, [visaFilterCountry, visaPurpose]);

  useEffect(() => {
    onPackagesFilterChange?.({ destination, priceMax: packagesBudget });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPackagesFilterChange is the parent's setState setter, stable across renders.
  }, [destination, packagesBudget]);

  useEffect(() => {
    onHotelsFilterChange?.({ destination });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onHotelsFilterChange is the parent's setState setter, stable across renders.
  }, [destination]);

  useEffect(() => {
    onCruisesFilterChange?.({
      country: cruiseCountry,
      port: cruisePort,
      departAfter: cruiseDepart,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onCruisesFilterChange is the parent's setState setter, stable across renders.
  }, [cruiseCountry, cruisePort, cruiseDepart]);

  useEffect(() => {
    onFlightsFilterChange?.({ originCode, destinationCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onFlightsFilterChange is the parent's setState setter, stable across renders.
  }, [originCode, destinationCode]);

  /*
   * Pinned under the header on a phone, the widget folds down to its tabs and
   * one summary line of what is chosen; a tap opens the full form inside the
   * bar. The form stays mounted while folded (hidden, not removed) so the
   * fields with no state of their own here — a package date, a guest count —
   * keep what was typed. Unpinning always folds it back.
   */
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [wasStuck, setWasStuck] = useState(stuck);
  if (stuck !== wasStuck) {
    setWasStuck(stuck);
    setExpanded(false);
  }
  const folded = stuck && !expanded;

  function labelOf(options: BookingOption[], value: string) {
    return options.find((option) => option.value === value)?.label ?? value;
  }

  /** What is chosen on the open tab, in one line — the folded bar's label. */
  function summary(): string {
    const anyDestination = t("anyDestination");
    const isArabic = locale === "ar";
    switch (tab) {
      case "packages":
        return [
          destination ? labelOf(destinations, destination) : anyDestination,
          packagesBudget
            ? t("upTo", { amount: Number(packagesBudget).toLocaleString("en-US") })
            : t("anyBudget"),
        ].join(" · ");
      case "hotels":
        return [destination ? labelOf(destinations, destination) : anyDestination, checkIn]
          .filter(Boolean)
          .join(" · ");
      case "visas":
        return [
          visaCountry ? labelOf(visaCountries, visaCountry) : t("chooseCountry"),
          visaPurpose
            ? t(`visaPurposes.${visaPurpose as "tourism" | "business" | "study"}`)
            : t("anyVisaType"),
        ].join(" · ");
      case "cruises": {
        const port = cruisePorts.find((row) => row.code === cruisePort);
        const country = cruisePorts.find((row) => row.country_code === cruiseCountry);
        const place = port
          ? isArabic
            ? port.city_ar
            : port.city_en
          : country
            ? isArabic
              ? country.country_ar
              : country.country_en
            : anyDestination;
        return [place, cruiseDepart].filter(Boolean).join(" · ");
      }
      case "flights":
        return [origin, arrival || t("toPlaceholder")].filter(Boolean).join(" · ");
    }
  }

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
          never think to look for, because nothing said it was there. On a
          phone they are one row of five, icon over label, like an app's tab
          bar: wrapping took two rows, and this strip now stays pinned under
          the header on the homepage, where every pixel of height is paid for
          on every screen of the scroll. */}
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="mb-2 grid grid-cols-5 gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-white/10 lg:mb-0 lg:flex lg:flex-wrap lg:gap-2 lg:rounded-none lg:bg-transparent lg:p-0 lg:pb-2.5 lg:ring-0"
      >
        {TABS.map(({ id, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(id);
              }}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[11px] leading-tight font-semibold transition-all duration-200",
                "lg:shrink-0 lg:flex-row lg:gap-2 lg:rounded-full lg:px-4 lg:py-2 lg:text-sm",
                active
                  ? "text-navy-900 bg-white shadow-md"
                  : "text-white/85 hover:bg-white/15 lg:bg-white/10 lg:hover:bg-white/20",
              )}
            >
              {/* The icon carries the selection too, not just the pill behind
                  it — on a phone the tab strip scrolls, and colour reads at a
                  glance where a background change does not. */}
              <Icon
                className={cn(
                  "h-4 w-4 lg:h-5 lg:w-5",
                  "ease-out-soft transition-all duration-200",
                  active && "text-gold-600 scale-110",
                )}
              />
              <span className="max-w-full truncate">{t(`tabs.${id}`)}</span>
            </button>
          );
        })}
      </div>

      {folded ? (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
          }}
          aria-expanded={false}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2 text-start shadow-lg lg:hidden"
        >
          <span className="bg-gold-50 text-gold-700 grid h-9 w-9 shrink-0 place-items-center rounded-xl">
            <SearchIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-sand-500 block text-[11px] font-medium">{t(`tabs.${tab}`)}</span>
            <span className="text-navy-900 block truncate text-sm font-semibold">{summary()}</span>
          </span>
          <span className="bg-navy-900 shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white">
            {t("editSearch")}
          </span>
        </button>
      ) : null}

      {/* noValidate so the guard in handleSubmit is what runs. Left to the
          browser, an out-of-range date is refused with a native tooltip in the
          browser's language rather than the site's — an Arabic visitor on an
          English-configured phone gets an English error on an Arabic form. */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(
          "rounded-2xl bg-white p-2 shadow-xl lg:rounded-3xl lg:p-2",
          folded && "hidden",
        )}
        key={tab}
      >
        {tab === "flights" ? (
          <div className="flex flex-wrap gap-1.5 pb-2 lg:gap-2 lg:px-2 lg:pt-2 lg:pb-1">
            {([true, false] as const).map((isRound) => (
              <button
                key={String(isRound)}
                type="button"
                onClick={() => {
                  setRoundTrip(isRound);
                }}
                aria-pressed={roundTrip === isRound}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors lg:px-4 lg:py-1.5 lg:text-sm",
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

        {/* On a phone: a two-column grid of field tiles, with an odd last
            field taking the full row, and the submit button full width under
            them — every field whole and readable, nothing cut off at an edge.
            From lg up: the single divided row it always was. */}
        <div className="flex flex-col gap-2 lg:mt-1 lg:flex-row lg:items-stretch lg:gap-0">
          <div className="divide-sand-200 grid min-w-0 flex-1 grid-cols-2 gap-1.5 lg:flex lg:items-stretch lg:gap-0 lg:divide-x [&>*:last-child:nth-child(odd)]:col-span-2">
            {tab === "flights" ? (
              <>
                <BookingField label={t("from")} icon={<PlaneIcon className={iconClass} />}>
                  <AirportPicker
                    name="from"
                    variant="widget"
                    value={origin}
                    onChange={(value, item) => {
                      setOrigin(value);
                      setOriginCode(item?.badge ?? "");
                    }}
                    popular={popularAirports}
                  />
                </BookingField>
                <BookingField label={t("to")} icon={<PinIcon className={iconClass} />}>
                  <AirportPicker
                    name="search"
                    variant="widget"
                    value={arrival}
                    onChange={(value, item) => {
                      setArrival(value);
                      setDestinationCode(item?.badge ?? "");
                    }}
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
                  <select
                    name="price_max"
                    className={bookingControlClass}
                    value={packagesBudget}
                    onChange={(event) => {
                      setPackagesBudget(event.target.value);
                    }}
                  >
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
                      setVisaFilterCountry(item ? value : "");
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
                      setVisaPurpose(event.target.value);
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
                  <input
                    type="date"
                    name="depart"
                    min={today}
                    value={cruiseDepart}
                    onChange={(event) => {
                      setCruiseDepart(event.target.value);
                    }}
                    className={bookingControlClass}
                  />
                </BookingField>
              </>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-2 lg:items-center lg:p-1.5 lg:ps-3">
            {/* An arrow, not a magnifier: this button does not search an
                inventory, it carries what has been filled in through to the
                request form an agent answers. */}
            <Button
              type="submit"
              size="lg"
              className="max-lg:h-11 max-lg:flex-1 max-lg:rounded-xl max-lg:text-base lg:h-12 lg:w-auto"
            >
              <span>{t("search")}</span>
              <ChevronForwardIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Button>
            {/* Folds the pinned bar back down. Only exists while pinned, and
                pinning only happens on a phone. */}
            {stuck ? (
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                }}
                aria-label={t("closeSearch")}
                className="border-sand-200 text-navy-900 grid h-11 w-11 shrink-0 place-items-center rounded-xl border lg:hidden"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {dateError ? (
        <p
          role="alert"
          className="bg-danger-600/95 mt-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
        >
          {dateError}
        </p>
      ) : null}

      {stuck ? null : (
        <p className="mt-2.5 text-center text-xs text-white/70 lg:mt-2 lg:text-start">
          {t("disclaimer")}
        </p>
      )}
    </div>
  );
}
