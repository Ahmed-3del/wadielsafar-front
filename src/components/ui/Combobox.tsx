"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

/* The measurement below must land before paint, but React warns when
   useLayoutEffect runs during a server render — which client components still
   get in the App Router. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface ComboboxItem {
  /** What gets submitted. For airports this is "الرياض (RUH)" — the reader at
   *  the other end is an agent on WhatsApp, not a machine. */
  value: string;
  label: string;
  /** Second line: the airport's own name, or the country. */
  description?: string;
  /** Trailing chip. The IATA code, where there is one. */
  badge?: string;
  /** ISO 3166-1 alpha-2, turned into a flag at render time. */
  countryCode?: string;
}

interface ComboboxProps {
  /** Submitted with the surrounding plain <form>. Omit inside react-hook-form,
   *  which tracks the value itself. */
  name?: string;
  value: string;
  onChange: (value: string, item: ComboboxItem | null) => void;
  /** Fixed option set. Supply this or `loadItems`, not both. */
  items?: ComboboxItem[];
  /** Async option set, called as the traveller types. */
  loadItems?: (term: string, signal: AbortSignal) => Promise<ComboboxItem[]>;
  /** Shown before anything is typed, when `loadItems` is used. */
  initialItems?: ComboboxItem[];
  placeholder?: string;
  /** Accept a typed value that matches no option. True for a city, false for a
   *  country we have to be able to resolve. */
  allowCustom?: boolean;
  /** `widget` sits on the hero's white card under a small label; `form` is a
   *  bordered control in a normal form; `inline` is `form` without the search
   *  affordance, for when it shares a row with another control. */
  variant?: "widget" | "form" | "inline";
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labels: {
    /** Announced as the listbox's name. */
    listbox: string;
    empty: string;
    loading: string;
    /** Heading above the pre-typing suggestions. */
    suggestions?: string;
  };
}

/** Regional indicators. Windows has no flag glyphs and falls back to the two
 *  letters, which still reads as a country code rather than as breakage. */
function flagFor(countryCode?: string): string | null {
  if (!countryCode || countryCode.length !== 2) return null;
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((c) => base + c.charCodeAt(0) - 65),
  );
}

/*
 * A searchable picker that looks like the rest of the site.
 *
 * The list is rendered through a portal rather than inside the field. The hero
 * is `overflow-hidden` and the widget's tab strip scrolls horizontally, so a
 * dropdown positioned inside the form gets clipped at the hero's bottom edge —
 * which is exactly where the departure and arrival fields sit.
 */
export function Combobox({
  name,
  value,
  onChange,
  items,
  loadItems,
  initialItems = [],
  placeholder,
  allowCustom = false,
  variant = "form",
  id,
  required,
  disabled,
  className,
  labels,
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? `combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;

  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [remote, setRemote] = useState<ComboboxItem[]>([]);
  const [rect, setRect] = useState<
    { top: number; left: number; width: number; below: boolean; maxHeight: number } | null
  >(null);

  const isAsync = typeof loadItems === "function";
  const trimmed = query.trim();

  // Static mode filters locally; async mode shows whatever the server ranked,
  // and falls back to the suggestions before anything is typed.
  const options: ComboboxItem[] = isAsync
    ? trimmed
      ? remote
      : initialItems
    : (items ?? []).filter((item) => {
        if (!trimmed) return true;
        const haystack = `${item.label} ${item.description ?? ""} ${item.badge ?? ""}`.toLowerCase();
        return haystack.includes(trimmed.toLowerCase());
      });

  const showSuggestionsHeading = Boolean(labels.suggestions) && isAsync && !trimmed && options.length > 0;

  /* What the field shows when it is not being typed into. Destinations and
     visa countries submit a slug or an id, so echoing the raw value back would
     put "dubai" or "3" in the box. Async options carry their own label in the
     value, and a typed custom answer is its own label. */
  const display = (items ?? []).find((item) => item.value === value)?.label ?? value;

  /* ---------------------------------------------------------------- search */

  const requestId = useRef(0);
  const justSelected = useRef(false);

  useEffect(() => {
    if (!isAsync || !open || !trimmed) return;
    // Only the newest request may write state. Aborting the previous fetch is
    // not enough on its own: a reply already in flight still resolves.
    const id = ++requestId.current;
    const controller = new AbortController();
    // Debounced, because a picker that fires on every keystroke sends five
    // requests to spell "Riyadh" and races their answers.
    const timer = setTimeout(() => {
      setLoading(true);
      loadItems(trimmed, controller.signal)
        .then((result) => {
          if (id !== requestId.current) return;
          setRemote(result);
          setActive(0);
        })
        .catch(() => { /* aborted or offline — the empty state covers both */ })
        .finally(() => { if (id === requestId.current) setLoading(false); });
    }, 200);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, isAsync, open, loadItems]);

  /* -------------------------------------------------------------- position */

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const box = anchor.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const spaceBelow = window.innerHeight - box.bottom - gap - margin;
    const spaceAbove = box.top - gap - margin;
    /* Below is where a dropdown belongs, so it only flips when below cannot
       hold a usable list AND above is roomier. Flipping merely because there
       is marginally more room above puts the list over the page's headline. */
    const below = spaceBelow >= 200 || spaceBelow >= spaceAbove;

    const width = Math.max(box.width, 320);
    // Keep it on screen horizontally too: a field near either edge would
    // otherwise push a wider list past the viewport.
    const left = Math.min(
      Math.max(margin, box.left),
      Math.max(margin, window.innerWidth - width - margin),
    );

    setRect({
      top: below ? box.bottom + gap : box.top - gap,
      left,
      width,
      below,
      // Capped to the room that exists, so the list scrolls instead of
      // running off the edge of the screen.
      maxHeight: Math.max(160, Math.min(320, below ? spaceBelow : spaceAbove)),
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  /* --------------------------------------------------------------- closing */

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); };
  }, [open]);

  // Keep the highlighted row in view when arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${String(active)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  /* ------------------------------------------------------------ selection */

  function openWith(nextQuery: string) {
    setQuery(nextQuery);
    setActive(0);
    setOpen(true);
  }

  function select(item: ComboboxItem) {
    // The blur below runs before React re-renders, so the blur handler would
    // still see the half-typed query and commit "جد" over the "جدة (JED)" just
    // chosen. The flag is the only state that updates in time.
    justSelected.current = true;
    onChange(item.value, item);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function commitTyped() {
    if (justSelected.current || !allowCustom || !trimmed) return;
    onChange(trimmed, null);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { setOpen(true); return; }
      if (options.length === 0) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + delta + options.length) % options.length);
      return;
    }
    if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const item = options[active];
      if (item) select(item);
      else commitTyped();
      return;
    }
    if (event.key === "Escape") {
      if (!open) return;
      event.preventDefault();
      setQuery("");
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      commitTyped();
      setOpen(false);
    }
  }

  /* -------------------------------------------------------------- rendering */

  const bordered =
    "w-full rounded-xl border border-sand-200 bg-white py-3 text-base text-navy-900 outline-none transition-colors placeholder:text-sand-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25";
  const inputClass =
    variant === "widget"
      ? "booking-control text-base font-semibold text-navy-900 placeholder:font-normal placeholder:text-sand-400"
      : cn(bordered, variant === "inline" ? "px-3" : "px-4");

  const list =
    open && rect
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: rect.below ? rect.top : undefined,
              bottom: rect.below ? undefined : window.innerHeight - rect.top,
              left: rect.left,
              width: rect.width,
              zIndex: 60,
            }}
            className="animate-combobox"
          >
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={labels.listbox}
              style={{ maxHeight: rect.maxHeight }}
              className="overflow-y-auto overscroll-contain rounded-2xl border border-sand-200 bg-white p-1.5 shadow-2xl shadow-navy-900/10"
            >
              {showSuggestionsHeading ? (
                <li
                  aria-hidden="true"
                  className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-sand-500"
                >
                  {labels.suggestions}
                </li>
              ) : null}

              {loading && options.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-sand-500">{labels.loading}</li>
              ) : null}

              {!loading && options.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-sand-500">{labels.empty}</li>
              ) : null}

              {options.map((item, index) => {
                const selected = item.value === value;
                const flag = flagFor(item.countryCode);
                return (
                  <li
                    key={`${item.value}-${item.badge ?? index}`}
                    id={`${listboxId}-option-${String(index)}`}
                    data-index={index}
                    role="option"
                    aria-selected={selected}
                    // Selecting on pointerdown, not click: the field lives
                    // inside a <label>, and letting focus move first hands the
                    // click back to the input and closes the list first.
                    onPointerDown={(event) => { event.preventDefault(); select(item); }}
                    onMouseEnter={() => { setActive(index); }}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      index === active ? "bg-sand-100" : "bg-transparent",
                    )}
                  >
                    {flag ? (
                      <span aria-hidden="true" className="shrink-0 text-lg leading-none">{flag}</span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy-900">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="block truncate text-xs text-sand-500">{item.description}</span>
                      ) : null}
                    </span>
                    {item.badge ? (
                      <span
                        dir="ltr"
                        className="shrink-0 rounded-md bg-navy-50 px-2 py-1 font-mono text-xs font-bold tracking-wider text-navy-700"
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    {selected ? (
                      <CheckIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-600" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      {/* The visible field is a search box: it shows the chosen value when
          idle, and what is being typed while the list is open. */}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[active] ? `${listboxId}-option-${String(active)}` : undefined
        }
        disabled={disabled}
        required={required && !value}
        placeholder={open && display ? display : placeholder}
        value={open ? query : display}
        onChange={(event) => { openWith(event.target.value); }}
        onFocus={() => { setOpen(true); }}
        onClick={() => { setOpen(true); }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // A typed city with nothing clicked is still an answer.
          if (allowCustom && trimmed) commitTyped();
          justSelected.current = false;
        }}
        className={cn(inputClass, variant === "form" && "ps-10")}
      />

      {variant === "form" ? (
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-sand-400"
        />
      ) : null}

      {/* Plain <form> submission (the hero widget) reads this; react-hook-form
          ignores it and tracks the value itself. */}
      {name ? <input type="hidden" name={name} value={value} /> : null}

      {list}
    </div>
  );
}
