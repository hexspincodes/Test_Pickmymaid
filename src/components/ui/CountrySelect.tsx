"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  COUNTRIES,
  POPULAR_COUNTRY_CODES,
  findCountryByCode,
  findCountryByName,
  flagSrc,
  type Country,
} from "@/lib/countries";

/* ─── Flag ───────────────────────────────────────────────────── */

export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    // Plain <img>: tiny local SVGs, no need for next/image optimisation.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagSrc(code)}
      alt=""
      width={24}
      height={16}
      loading="lazy"
      className={`h-4 w-6 shrink-0 rounded-[3px] object-cover ring-1 ring-black/10 ${className}`}
    />
  );
}

/* ─── CountrySelect ──────────────────────────────────────────── */

const POPULAR = POPULAR_COUNTRY_CODES.map(findCountryByCode).filter(
  (c): c is Country => !!c
);

interface Option {
  key: string;
  country: Country;
  group?: string;
}

// Searchable dropdown of every country with its flag.
//   mode="name": value/onChange use the country name (e.g. nationality).
//   mode="dial": value/onChange use the ISO code; the trigger shows flag +
//                dialing code. ISO, not "+1", because several countries share a code.
export function CountrySelect({
  mode,
  value,
  onChange,
  id,
  placeholder = "Select country",
  hasError = false,
  ariaLabel,
  triggerClassName = "",
}: {
  mode: "name" | "dial";
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  hasError?: boolean;
  ariaLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = mode === "name" ? findCountryByName(value) : findCountryByCode(value);
  const isSelected = (c: Country) => (selected ? c.code === selected.code : false);

  const options = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...POPULAR.map((country, i) => ({
          key: `popular-${country.code}`,
          country,
          group: i === 0 ? "Popular" : undefined,
        })),
        ...COUNTRIES.map((country, i) => ({
          key: `all-${country.code}`,
          country,
          group: i === 0 ? "All countries" : undefined,
        })),
      ];
    }
    const digits = q.replace(/[^0-9]/g, "");
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        (digits && c.dial.replace("+", "").startsWith(digits))
    ).map((country) => ({ key: `match-${country.code}`, country }));
  }, [query]);

  // Close when clicking anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Focus the search box when opening.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted option visible while arrowing through the list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    setQuery("");
    const current = POPULAR.findIndex(isSelected);
    setActive(current >= 0 ? current : 0);
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(country: Country) {
    onChange(mode === "name" ? country.name : country.code);
    close();
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = options[active];
      if (option) choose(option.country);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  const triggerBase =
    "flex items-center gap-2 text-sm text-dark outline-none cursor-pointer transition-colors";
  const triggerStandalone = `w-full h-12 px-4 rounded-xl border ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary-50"
  }`;

  return (
    <div ref={rootRef} className={`relative ${mode === "dial" ? "shrink-0 h-full" : ""}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openList();
          }
        }}
        className={`${triggerBase} ${mode === "name" ? triggerStandalone : "h-full pl-3 pr-2"} ${triggerClassName}`}
      >
        {selected ? (
          <>
            <Flag code={selected.code} />
            <span className={mode === "name" ? "flex-1 truncate text-left" : "tabular-nums"}>
              {mode === "name" ? selected.name : selected.dial}
            </span>
          </>
        ) : (
          <span className="flex-1 truncate text-left text-muted/70">{placeholder}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-black/10 ${
            mode === "name" ? "w-full min-w-64" : "w-72"
          }`}
        >
          <div className="relative border-b border-gray-100 p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={mode === "dial" ? "Search country or code" : "Search country"}
              aria-label="Search countries"
              aria-controls={listId}
              aria-activedescendant={options[active] ? `${listId}-${active}` : undefined}
              className="h-10 w-full rounded-xl bg-[#F5F5F5] pl-9 pr-3 text-sm text-dark outline-none placeholder:text-muted/70"
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {options.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">No countries found</li>
            )}
            {options.map((option, index) => {
              const { country } = option;
              const chosen = isSelected(country);
              return (
                <li key={option.key} role="presentation">
                  {option.group && (
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {option.group}
                    </p>
                  )}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={chosen}
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(country)}
                    className={`mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                      index === active ? "bg-primary-50" : ""
                    } ${chosen ? "font-semibold text-primary" : "text-dark"}`}
                  >
                    <Flag code={country.code} />
                    <span className="flex-1 truncate">{country.name}</span>
                    {mode === "dial" && (
                      <span className="tabular-nums text-xs text-muted">{country.dial}</span>
                    )}
                    {chosen && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
