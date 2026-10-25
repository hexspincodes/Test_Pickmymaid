"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";
import { SplitButton } from "../ui/SplitButton";
import { Flag } from "../ui/CountrySelect";
import { SkillSearchBox } from "../ui/SkillSearchBox";
import { useSkillOptions } from "@/lib/useSkillOptions";
import {
  COUNTRIES,
  POPULAR_COUNTRY_CODES,
  findCountryByCode,
  findCountryByName,
} from "@/lib/countries";

const LOCATIONS = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
  "Al Ain",
];
const ANY_SKILL = "Any Skill";
const NATIONALITIES = COUNTRIES.map((c) => c.name);
// The UAE leads the shared popular list but isn't a maid nationality.
const POPULAR_NATIONALITIES = POPULAR_COUNTRY_CODES.filter((code) => code !== "AE")
  .map((code) => findCountryByCode(code)?.name)
  .filter((name): name is string => !!name);

function NationalityFlag(name: string) {
  const country = findCountryByName(name);
  return country ? <Flag code={country.code} /> : null;
}

// Themed replacement for <select>: the native option list can't be styled.
//   searchable: adds a filter box above the list.
//   popular:    shown first under a "Popular" heading while the filter is empty.
function HeroSelect({
  label,
  value,
  options,
  onChange,
  searchable = false,
  popular,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  searchable?: boolean;
  popular?: string[];
  icon?: (option: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const items = useMemo<{ key: string; value: string; group?: string }[]>(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return options
        .filter((o) => o.toLowerCase().includes(q))
        .map((o) => ({ key: o, value: o }));
    }
    if (!popular?.length) return options.map((o) => ({ key: o, value: o }));
    return [
      ...popular.map((o, i) => ({
        key: `popular-${o}`,
        value: o,
        group: i === 0 ? "Popular" : undefined,
      })),
      ...options.map((o, i) => ({
        key: `all-${o}`,
        value: o,
        group: i === 0 ? "All countries" : undefined,
      })),
    ];
  }, [options, popular, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    setQuery("");
    const list = popular?.length ? popular : options;
    setActive(Math.max(0, list.indexOf(value)));
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(option: string) {
    onChange(option);
    close();
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || (!searchable && e.key === " ")) {
      e.preventDefault();
      if (items[active]) choose(items[active].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Select ${label.toLowerCase()}`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (open) {
            if (!searchable) onListKeyDown(e);
          } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className="w-full px-6 text-left cursor-pointer outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary-200"
      >
        <span className="block text-base font-medium text-dark/50 leading-6 tracking-[0.25px] mb-2">
          {label}
        </span>
        <span className="flex items-center gap-2">
          {icon?.(value)}
          <span className="flex-1 truncate text-base font-semibold text-dark leading-6 tracking-[0.25px]">
            {value}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-dark/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full z-50 mt-4 min-w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0px_19px_40px_0px_rgba(0,0,0,0.10)]">
          {searchable && (
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
                onKeyDown={onListKeyDown}
                placeholder={`Search ${label.toLowerCase()}`}
                aria-label={`Search ${label.toLowerCase()}`}
                aria-controls={listId}
                aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
                className="h-10 w-full rounded-xl bg-[#F5F5F5] pl-9 pr-3 text-sm text-dark outline-none placeholder:text-muted/70"
              />
            </div>
          )}

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-72 overflow-y-auto py-1"
          >
            {items.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">No results found</li>
            )}
            {items.map((item, index) => {
              const chosen = item.value === value;
              return (
                <li key={item.key} role="presentation">
                  {item.group && (
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {item.group}
                    </p>
                  )}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={chosen}
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item.value)}
                    className={`mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm tracking-[0.25px] ${
                      index === active ? "bg-primary-50" : ""
                    } ${chosen ? "font-semibold text-primary" : "font-medium text-dark"}`}
                  >
                    {icon?.(item.value)}
                    <span className="flex-1 truncate">{item.value}</span>
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

export function SearchBar({
  variant,
}: {
  variant: "mobile" | "desktop";
}) {
  const router = useRouter();
  const [location, setLocation] = useState("Dubai");
  const [skill, setSkill] = useState(ANY_SKILL);
  const skillOptions = useSkillOptions();
  const [nationality, setNationality] = useState("Philippines");
  const [mobileQuery, setMobileQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams({
      location,
      nationality,
      page: "1",
    });
    if (skill !== ANY_SKILL) params.set("skills", skill);
    router.push(`/search?${params.toString()}`);
  };

  const searchSkill = (s: string) => {
    const params = new URLSearchParams({ skills: s, page: "1" });
    router.push(`/search?${params.toString()}`);
  };

  // The search page turns a keyword that names a skill into a skill search.
  const handleMobileSearch = () => {
    const params = new URLSearchParams({ q: mobileQuery.trim(), page: "1" });
    router.push(`/search?${params.toString()}`);
  };

  if (variant === "desktop") {
    return (
      <div className="relative z-20 hidden lg:flex backdrop-blur-[34px] bg-white/70 border border-white rounded-2xl drop-shadow-[0px_19px_20px_rgba(0,0,0,0.1)] mt-10 p-2">
        <HeroSelect
          label="Location"
          value={location}
          options={LOCATIONS}
          onChange={setLocation}
        />

        <div className="w-px self-stretch bg-dark/10 my-5" />

        <HeroSelect
          label="Skill"
          value={skill}
          options={[ANY_SKILL, ...skillOptions]}
          onChange={setSkill}
        />

        <div className="w-px self-stretch bg-dark/10 my-5" />

        <HeroSelect
          label="Nationality"
          value={nationality}
          options={NATIONALITIES}
          popular={POPULAR_NATIONALITIES}
          onChange={setNationality}
          icon={NationalityFlag}
          searchable
        />

        <SplitButton
          aria-label="Search"
          icon={<Search />}
          onClick={handleSearch}
        />
      </div>
    );
  }

  return (
    <div className="lg:hidden">
      <SkillSearchBox
        value={mobileQuery}
        onValueChange={setMobileQuery}
        onSearch={handleMobileSearch}
        onPickSkill={searchSkill}
        placeholder="Search by skill, e.g. Child Care"
        ariaLabel="Search by skill"
        barClassName="flex backdrop-blur-[34px] bg-white/70 border border-white rounded-2xl drop-shadow-[0px_19px_20px_rgba(0,0,0,0.05)] overflow-hidden"
        inputClassName="flex-1 text-base font-medium text-dark placeholder:text-dark/50 pl-4 py-3 bg-transparent border-none outline-none min-w-0 tracking-[0.25px] leading-6"
        buttons={<SplitButton type="submit" aria-label="Search" icon={<Search />} />}
      />
    </div>
  );
}
